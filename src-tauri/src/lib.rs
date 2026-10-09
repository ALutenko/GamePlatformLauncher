use futures_util::StreamExt;
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use tauri::{Emitter, Manager};

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct InstallProgress {
    game_id: String,
    bytes: u64,
    total: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct InstallResult {
    path: String,
    archive: String,
    sha256: String,
    extracted: bool,
}

/// Download a release into `<app_data>/games/<game_id>/`, verify sha256 and,
/// when the payload is a zip archive, extract it next to the download.
/// Progress is streamed to the webview as `install-progress` events.
#[tauri::command]
async fn install_release(
    app: tauri::AppHandle,
    game_id: String,
    url: String,
    sha256: String,
    executable: String,
) -> Result<InstallResult, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("games")
        .join(&game_id);
    tokio::fs::create_dir_all(&dir)
        .await
        .map_err(|e| e.to_string())?;
    let archive = dir.join("build.bin");

    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    if !response.status().is_success() {
        return Err(format!("download failed: HTTP {}", response.status()));
    }
    let total = response.content_length().unwrap_or(0);
    let mut stream = response.bytes_stream();
    let mut file = tokio::fs::File::create(&archive)
        .await
        .map_err(|e| e.to_string())?;
    let mut hasher = Sha256::new();
    let mut received: u64 = 0;
    let mut last_emit: u64 = 0;
    while let Some(chunk) = stream.next().await {
        let bytes = chunk.map_err(|e| e.to_string())?;
        hasher.update(&bytes);
        tokio::io::AsyncWriteExt::write_all(&mut file, &bytes)
            .await
            .map_err(|e| e.to_string())?;
        received += bytes.len() as u64;
        // Throttle events to roughly every 256 KiB.
        if received - last_emit >= 256 * 1024 {
            last_emit = received;
            let _ = app.emit(
                "install-progress",
                InstallProgress {
                    game_id: game_id.clone(),
                    bytes: received,
                    total,
                },
            );
        }
    }
    tokio::io::AsyncWriteExt::flush(&mut file)
        .await
        .map_err(|e| e.to_string())?;
    drop(file);
    let _ = app.emit(
        "install-progress",
        InstallProgress {
            game_id: game_id.clone(),
            bytes: received,
            total: if total == 0 { received } else { total },
        },
    );

    let digest = hex::encode(hasher.finalize());
    if !sha256.is_empty() && digest != sha256 {
        let _ = tokio::fs::remove_file(&archive).await;
        return Err(format!(
            "sha256 mismatch: expected {}, got {}",
            sha256, digest
        ));
    }

    let extracted = if is_zip(&archive).await {
        let archive_path = archive.clone();
        let target = dir.clone();
        tokio::task::spawn_blocking(move || extract_zip(&archive_path, &target))
            .await
            .map_err(|e| e.to_string())??;
        true
    } else {
        false
    };

    let exe = dir.join(&executable);
    if !extracted && !exe.exists() {
        // Raw single-file build: the download itself is the executable.
        tokio::fs::rename(&archive, &exe)
            .await
            .map_err(|e| e.to_string())?;
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let _ = std::fs::set_permissions(&exe, std::fs::Permissions::from_mode(0o755));
        }
    }

    Ok(InstallResult {
        path: exe.to_string_lossy().into_owned(),
        archive: archive.to_string_lossy().into_owned(),
        sha256: digest,
        extracted,
    })
}

async fn is_zip(path: &Path) -> bool {
    use tokio::io::AsyncReadExt;
    let Ok(mut file) = tokio::fs::File::open(path).await else {
        return false;
    };
    let mut magic = [0u8; 4];
    file.read_exact(&mut magic).await.is_ok() && magic == [0x50, 0x4B, 0x03, 0x04]
}

fn extract_zip(archive: &Path, target: &Path) -> Result<(), String> {
    let file = std::fs::File::open(archive).map_err(|e| e.to_string())?;
    let mut zip = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;
    zip.extract(target).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn launch_game(executable_path: String) -> Result<(), String> {
    let path = PathBuf::from(executable_path);
    if !path.exists() {
        return Err("game files not found — reinstall the game".to_string());
    }
    #[cfg(target_os = "macos")]
    {
        tokio::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(not(target_os = "macos"))]
    {
        let mut command = tokio::process::Command::new(&path);
        if let Some(parent) = path.parent() {
            command.current_dir(parent);
        }
        command.spawn().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![install_release, launch_game])
        .run(tauri::generate_context!())
        .expect("error while running Lutarea Launcher");
}

import type { CSSProperties } from "react";
import { assetUrl } from "../api/client";
import type { Game } from "../api/types";
import { GENRE_LABEL, STATUS_LABEL, hexToRgb, priceLabel, statusTone } from "./labels";

interface Props {
  games: Game[];
  selectedId: string | null;
  onSelect: (game: Game) => void;
  owned?: Set<string>;
  installed?: Set<string>;
}

export function GameGrid({ games, selectedId, onSelect, owned, installed }: Props) {
  return (
    <div className="grid">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          selected={game.id === selectedId}
          owned={owned?.has(game.id) ?? false}
          installed={installed?.has(game.id) ?? false}
          onSelect={() => onSelect(game)}
        />
      ))}
    </div>
  );
}

function GameCard({
  game,
  selected,
  owned,
  installed,
  onSelect,
}: {
  game: Game;
  selected: boolean;
  owned: boolean;
  installed: boolean;
  onSelect: () => void;
}) {
  const style = {
    "--accent": game.accent,
    "--accent-rgb": hexToRgb(game.accent),
  } as CSSProperties;
  const tone = statusTone(game.releaseStatus);
  const art = assetUrl(game.keyArtUrl ?? game.coverUrl);
  const icon = assetUrl(game.iconUrl);

  return (
    <button
      type="button"
      className={`card ${selected ? "is-selected" : ""}`}
      style={style}
      onClick={onSelect}
    >
      <div className="card-art">
        {art && <img src={art} alt="" loading="lazy" draggable={false} />}
        {icon && <img className="card-icon" src={icon} alt="" draggable={false} />}
        <span className={`pill card-badge ${installed ? "is-lime" : tone ? `is-${tone}` : ""}`}>
          {installed ? "Installed" : STATUS_LABEL[game.releaseStatus]}
        </span>
      </div>
      <div className="card-body">
        <strong>{game.title}</strong>
        <span>{GENRE_LABEL[game.genre]}</span>
      </div>
      <div className="card-foot">
        <span>{game.seriesTitle}</span>
        <b>{owned ? "In library" : priceLabel(game)}</b>
      </div>
    </button>
  );
}

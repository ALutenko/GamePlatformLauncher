import type { Game, GameGenre, GameReleaseStatus } from "../api/types";

/**
 * Offline catalog — vendored copy of Platform/gamesplatform/packages/shared/src/catalog.ts
 * (same ids, slugs, art stems). The launcher shows it immediately on boot and whenever the
 * games platform is unreachable, so guests can always browse the store. Server data replaces
 * it as soon as /catalog answers. Keep in sync by hand when the shared catalog changes.
 */

interface CatalogEntry {
  id: string;
  slug: string;
  /** Art file stem under /games/ (e.g. `/games/{art}-art.jpg`). Defaults to slug. */
  art?: string;
  title: string;
  series: string;
  seriesTitle: string;
  genre: GameGenre;
  releaseStatus: GameReleaseStatus;
  accent: string;
  tagline: string;
  description: string;
  kind: "free" | "paid";
  priceCents: number;
}

const TKOB = { series: "kingdom-of-beasts", seriesTitle: "The Kingdom of Beasts", accent: "#ff6a1a" } as const;

const PLANNED = "Planned; details will follow.";

const ENTRIES: CatalogEntry[] = [
  {
    id: "game_animal_heroes",
    slug: "animal-heroes",
    art: "tkob-heroes",
    title: "The Kingdom Of Beasts: Heroes",
    ...TKOB,
    genre: "strategy",
    releaseStatus: "development",
    tagline: "Fantasy adventure game.",
    description:
      "A tactical fantasy adventure set in the Kingdom of Beasts — factions, alliances, and battles where every choice has a cost. Premium game: buy once, download through Lutarea Launcher.",
    kind: "paid",
    priceCents: 1499,
  },
  {
    id: "game_tkob_online",
    slug: "tkob-online",
    title: "The Kingdom Of Beasts: Online",
    ...TKOB,
    genre: "collectionRpg",
    releaseStatus: "development",
    tagline: "Collection RPG of heroes and turn-based battles.",
    description:
      "Summon heroes, equip artifacts and fight turn-based battles of five against five — campaign, dungeons, arena and clans in the Kingdom of Beasts. Free client: add it to your library and download through the launcher.",
    kind: "free",
    priceCents: 0,
  },
  {
    id: "game_tkob_citadel",
    slug: "tkob-citadel",
    title: "The Kingdom Of Beasts: Citadel",
    ...TKOB,
    genre: "collectionRpg",
    releaseStatus: "planned",
    tagline: "The hub of the Kingdom: your account, castles and heroes.",
    description: `The meta-hub of The Kingdom of Beasts: one account, sixteen faction castles, heroes and artifacts you level up between campaigns, cosmetics and cross-game rewards. ${PLANNED}`,
    kind: "free",
    priceCents: 0,
  },
  {
    id: "game_tkob_kairon",
    slug: "tkob-kairon",
    title: "The Kingdom Of Beasts: Kairon",
    ...TKOB,
    genre: "adventure",
    releaseStatus: "planned",
    tagline: "The life story of Kairon the lion.",
    description: `From a cub on the edge of the pride to the ruler who forged the Union — the biography of Kairon, leader of the Sun Savanna, as a narrative adventure that runs through the whole series. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_tkob_northern_wilds",
    slug: "tkob-northern-wilds",
    title: "The Kingdom Of Beasts: Northern Wilds",
    ...TKOB,
    genre: "strategy",
    releaseStatus: "planned",
    tagline: "Campaign of the taiga faction.",
    description: `The taiga campaign: brown bears, snowed-in forts and a faction that trusts nobody south of the treeline. Tactical battles and alliances of Arc I. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_tkob_sun_savanna",
    slug: "tkob-sun-savanna",
    title: "The Kingdom Of Beasts: Sun Savanna",
    ...TKOB,
    genre: "strategy",
    releaseStatus: "planned",
    tagline: "Campaign of the savanna faction.",
    description: `The savanna campaign: the lion pride, baobab councils and the first cracks in the old order. Tactical battles and alliances of Arc I. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_tkob_sky_reach",
    slug: "tkob-sky-reach",
    title: "The Kingdom Of Beasts: Sky Reach",
    ...TKOB,
    genre: "strategy",
    releaseStatus: "planned",
    tagline: "Campaign of the mountain-peak faction.",
    description: `The mountain-peak campaign: eagles above the clouds, fortresses on the ridges and a faction that sees everything first. Tactical battles and alliances of Arc I. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_worldspire",
    slug: "worldspire",
    title: "Worldspire",
    series: "worldspire",
    seriesTitle: "Worldspire",
    accent: "#8b5cf6",
    genre: "mmorpg",
    releaseStatus: "planned",
    tagline: "MMORPG with a full solo path.",
    description: `Awaken with a D-rank Gift nobody believes in, build around it with gear that stacks percentages, and climb the Spire floor by floor — alone or with up to four. One hundred floors open the Gate to the next tier of worlds. ${PLANNED}`,
    kind: "free",
    priceCents: 0,
  },
  {
    id: "game_wild_park",
    slug: "wild-park",
    title: "Wild Park",
    series: "wild-park",
    seriesTitle: "Wild Park",
    accent: "#22c55e",
    genre: "sim",
    releaseStatus: "planned",
    tagline: "Zoo sim.",
    description: `Tend habitats, learn what each animal needs and watch the park come alive around them. Calm, close to the animals. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_second_chance",
    slug: "second-chance",
    title: "Second Chance",
    series: "second-chance",
    seriesTitle: "Second Chance",
    accent: "#f472b6",
    genre: "sim",
    releaseStatus: "planned",
    tagline: "Animal shelter sim.",
    description: `Take in strays, nurse them back to health, learn their quirks and match them with the right family. Warm, slow, a little bittersweet. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_life_path",
    slug: "life-path",
    title: "Life Path",
    series: "life-path",
    seriesTitle: "Life Path",
    accent: "#38bdf8",
    genre: "lifeSim",
    releaseStatus: "planned",
    tagline: "Life and career simulator.",
    description: `Choose studies, jobs, habits and relationships, and watch one small decision ripple through decades. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_ashfall",
    slug: "ashfall",
    title: "Ashfall",
    series: "ashfall",
    seriesTitle: "Ashfall",
    accent: "#b91c1c",
    genre: "arpg",
    releaseStatus: "planned",
    tagline: "Dark action RPG.",
    description: `Hack-and-slash in the spirit of the classics: classes, loot, skill trees and endless dungeons under a sky of ash. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_hotfix",
    slug: "hotfix",
    title: "Hotfix",
    series: "hotfix",
    seriesTitle: "Hotfix",
    accent: "#22d3ee",
    genre: "sim",
    releaseStatus: "planned",
    tagline: "IT office survival sim.",
    description: `Pick a role, join a team, close tickets and survive releases. Stress, coffee, meetings and a career ladder from junior to lead — with a production incident always one click away. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_compound",
    slug: "compound",
    title: "Compound",
    series: "compound",
    seriesTitle: "Compound",
    accent: "#eab308",
    genre: "tycoon",
    releaseStatus: "planned",
    tagline: "Cash flow sim.",
    description: `Build an income statement that works for you: a salary to start, then assets, side businesses, loans and the markets. The goal is simple — passive income above your expenses. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_vitals",
    slug: "vitals",
    title: "Vitals",
    series: "vitals",
    seriesTitle: "Vitals",
    accent: "#fb923c",
    genre: "lifeSim",
    releaseStatus: "planned",
    tagline: "Life and health sim.",
    description: `One character, one lifetime. Balance sleep, food, movement, stress and relationships, and watch small daily choices become decades. Reach old age healthy and surrounded by people — or learn why you didn't. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_inkhouse",
    slug: "inkhouse",
    title: "Inkhouse",
    series: "inkhouse",
    seriesTitle: "Inkhouse",
    accent: "#d946ef",
    genre: "tycoon",
    releaseStatus: "planned",
    tagline: "Tattoo studio tycoon.",
    description: `Open a tiny tattoo studio, hire artists with their own styles, sketch designs for clients and manage ink, chairs and reputation until the whole city knows the name. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_hatchling",
    slug: "hatchling",
    title: "Hatchling",
    series: "hatchling",
    seriesTitle: "Hatchling",
    accent: "#a3e635",
    genre: "clicker",
    releaseStatus: "planned",
    tagline: "Creature evolution clicker.",
    description: `A creature hatches in your hands. Tap to feed, unlock traits, evolve through stages — each one changes its look, its mood and what it wants from you. Idle progress while you are away. ${PLANNED}`,
    kind: "free",
    priceCents: 0,
  },
  {
    id: "game_orebelt",
    slug: "orebelt",
    title: "Orebelt",
    series: "orebelt",
    seriesTitle: "Orebelt",
    accent: "#f97316",
    genre: "tycoon",
    releaseStatus: "planned",
    tagline: "Asteroid mining grinder.",
    description: `Start with one rig on one asteroid. Every rock in the belt hides its own ore; upgrade drills, hire crews, haul to the station and buy the next asteroid. A grinder about the satisfying loop of digging deeper. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_ink_and_steel",
    slug: "ink-and-steel",
    title: "Ink & Steel",
    series: "ink-and-steel",
    seriesTitle: "Ink & Steel",
    accent: "#ef4444",
    genre: "arpg",
    releaseStatus: "planned",
    tagline: "Action RPG about a blade and ink.",
    description: `You begin with a notched sword and a body without a mark. Each level sharpens the blade, each victory spreads glowing tattoos further across your skin — and each tattoo is a power. Action RPG, hard and personal. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_wayfarers",
    slug: "wayfarers",
    title: "Wayfarers",
    series: "wayfarers",
    seriesTitle: "Wayfarers",
    accent: "#c084fc",
    genre: "novel",
    releaseStatus: "planned",
    tagline: "Visual novel about two seekers.",
    description: `Two seekers cross a tired Earth looking for a place where life still makes sense. A visual novel of dialogues, choices and roads that remember what you did on them. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
  {
    id: "game_cartridge",
    slug: "cartridge",
    title: "Cartridge",
    series: "cartridge",
    seriesTitle: "Cartridge",
    accent: "#facc15",
    genre: "platformer",
    releaseStatus: "planned",
    tagline: "8-bit style platformer.",
    description: `A platformer in the spirit of the classics on a Dendy or Subor: worlds of pixel levels, hidden blocks, coins, warp zones and a jump that feels exactly right. ${PLANNED}`,
    kind: "paid",
    priceCents: 0,
  },
];

export function gameArtUrl(stem: string): string {
  return `/games/${stem}-art.jpg`;
}

export function gameIconUrl(stem: string): string {
  return `/games/${stem}-icon.jpg`;
}

export const OFFLINE_GAMES: Game[] = ENTRIES.map((entry) => {
  const stem = entry.art ?? entry.slug;
  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    tagline: entry.tagline,
    description: entry.description,
    kind: entry.kind,
    priceCents: entry.priceCents,
    currency: "USD",
    paddlePriceId: null,
    coverUrl: gameArtUrl(stem),
    iconUrl: gameIconUrl(stem),
    keyArtUrl: gameArtUrl(stem),
    screenshots: [],
    listed: true,
    series: entry.series,
    seriesTitle: entry.seriesTitle,
    genre: entry.genre,
    releaseStatus: entry.releaseStatus,
    accent: entry.accent,
  };
});

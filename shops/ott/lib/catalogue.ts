import { prng } from "@riptide/core";

/**
 * Reelbox catalogue: 64 fictional titles. Names and loglines are hand-written; everything else
 * (cast, ratings, runtimes, seasons, episodes, poster palette) is derived from prng(title id),
 * so it is identical on server and client and across builds.
 */
export const GENRES = [
  { id: "drama", name: "Drama" },
  { id: "thriller", name: "Thrillers" },
  { id: "comedy", name: "Comedy" },
  { id: "scifi", name: "Sci-fi & Fantasy" },
  { id: "romance", name: "Romance" },
  { id: "documentary", name: "Documentaries" },
  { id: "family", name: "Kids & Family" },
  { id: "crime", name: "Crime" },
] as const;
export type GenreId = (typeof GENRES)[number]["id"];

type Seed = [title: string, kind: "film" | "series", logline: string];
const SEEDS: Record<GenreId, Seed[]> = {
  drama: [
    ["The Salt Ledger", "series", "A family-run salt pan in Kutch faces a buyout that splits three generations down the middle."],
    ["Kites Over Kalimpong", "film", "A retired schoolteacher returns to the hill town she left forty years ago and finds it kept her letters."],
    ["The Glassmaker's Daughter", "series", "In 1950s Firozabad, a young apprentice reinvents her father's failing furnace."],
    ["Quiet Platform", "film", "Two strangers stranded overnight at a shuttered railway halt trade the truth about their lives."],
    ["Second Monsoon", "series", "A Kochi architect rebuilds her neighbourhood, and her marriage, after the floods."],
    ["Inkpot Lane", "film", "A printing-press owner fights to keep his Old Delhi shop running as the street changes around him."],
    ["Sunday at the Bhandaris", "series", "Every Sunday lunch at the Bhandari house hides a different secret."],
    ["Fleet of Paper", "film", "A boy in a Kolkata lane builds a fleet of paper boats to win back his best friend."],
  ],
  thriller: [
    ["Monsoon Protocol", "series", "A cyber-forensics analyst uncovers a plot hidden inside a coastal city's flood-warning system."],
    ["The Ninth Signal", "film", "A radio operator on a remote island picks up a distress call from a ship that sank years ago."],
    ["Hollow Tide", "series", "When a trawler drifts home empty, a coast guard officer starts asking questions nobody wants answered."],
    ["Blind Corridor", "film", "A hotel night manager has eight hours to find a missing guest before the morning shift arrives."],
    ["Cipher Garden", "series", "A botanist's coded field notes become the key to an unsolved disappearance."],
    ["Still Water Run", "film", "A swimmer training for nationals sees something at the reservoir she can't unsee."],
    ["The Keeper's Logbook", "series", "A lighthouse keeper's logbook points to a smuggling ring along the Konkan coast."],
    ["Afterglow Station", "film", "A metro breakdown traps six passengers, and one secret, underground."],
  ],
  comedy: [
    ["Uncle Chintu Has Opinions", "series", "A retired bank clerk becomes an accidental neighbourhood influencer."],
    ["Three Cousins, One Mandap", "film", "Three cousins each try to plan the same wedding, without telling the others."],
    ["The Tiffin Union", "film", "A crew of lunchbox couriers goes on strike, and the whole business district goes hungry."],
    ["Startup Ka Scene", "series", "Four friends launch an app nobody asked for from a garage in Bengaluru."],
    ["Mrs. Rao's Driving School", "series", "A no-nonsense instructor meets her most hopeless batch yet."],
    ["Lost in Lonavala", "film", "A family road trip goes wrong in every possible direction."],
    ["Night Shift Neighbours", "series", "The tenants above a 24-hour pharmacy get to know each other at 3 a.m."],
    ["Plan B Bakery", "film", "A failed chef opens a bakery that only sells what went wrong."],
  ],
  scifi: [
    ["Copper Sky Colony", "series", "Settlers on a terraformed moon discover the sky isn't the only thing that was engineered."],
    ["Orbit of Small Things", "film", "A teenage inventor's homemade satellite starts receiving replies."],
    ["The Quiet Array", "series", "Astronomers at a high-altitude observatory decode a pattern older than the stars they study."],
    ["Echo Protocol 7", "film", "A memory-backup engineer wakes up inside someone else's archive."],
    ["Saltwater Androids", "series", "Robots built to clean the ocean begin making decisions of their own."],
    ["Year Zero Ward", "film", "A hospital wing slips one minute out of sync with the rest of the world."],
    ["Orbital Bazaar", "series", "A trader on a deep-space market station gets caught between two rival fleets."],
    ["Rust Belt on Mars", "film", "An old mechanic refuses to leave the red planet when the last shuttle departs."],
  ],
  romance: [
    ["Letters to Lansdowne", "film", "Two pen pals fall for each other without ever meeting."],
    ["Rain Check in Goa", "film", "A wedding photographer and a jilted groom keep running into each other all monsoon."],
    ["Marigold Summer", "series", "A florist and a food-truck owner share one parking spot and endless arguments."],
    ["The Seventh Date", "film", "A dating-app engineer tests her own matching algorithm on herself."],
    ["Between Two Stations", "series", "Daily commuters on the same local train build a love story over one year."],
    ["Saffron and Sea Salt", "film", "A chef from the valley and a fisherman from the coast open a restaurant together."],
    ["Sleeper Class, Seat 42", "film", "A long overnight train across the Deccan seats two exes side by side."],
    ["The Matchmaker's Son", "series", "An old-school matchmaker takes on her most stubborn client: her own son."],
  ],
  documentary: [
    ["Rivers That Remember", "series", "The ecology and folklore of five rivers, followed from source to sea."],
    ["Warp and Weft Keepers", "film", "Master weavers in four states fight to keep handloom traditions alive."],
    ["Midnight Bazaars", "series", "After dark in the street-food markets of the continent's busiest cities."],
    ["A Year in the Terai", "film", "Twelve months with the forest guards and conservationists of the northern grasslands."],
    ["Built in a Week", "series", "Engineers race the clock to raise emergency bridges, clinics and homes."],
    ["The Spice Route Revisited", "series", "A culinary historian retraces the trade routes that shaped how the world cooks."],
    ["Fifty Overs", "film", "Inside a small-town cricket club's quest for its first state trophy."],
    ["Deep Blue Ladder", "film", "Free divers in the Andaman Sea push the limits of a single breath."],
  ],
  family: [
    ["Moonbeam Express", "film", "A toy train runs off the tracks and into a city of lost toys."],
    ["Pip and the Paper Tiger", "series", "A shy girl's origami tiger comes to life every evening at six."],
    ["The Cloud Shepherds", "film", "Two siblings herd runaway clouds back home before the monsoon begins."],
    ["Dadaji's Tin Helper", "series", "A retired engineer and his grandson build a robot that's a little too helpful."],
    ["Turtle Island Club", "series", "Five kids protect a nesting beach over one summer holiday."],
    ["Mango Tree Detectives", "series", "A gang of kids solve neighbourhood mysteries from their treehouse."],
    ["Kiko Learns to Fly", "film", "A young bird with a crooked wing invents her own way to soar."],
    ["The Biscuit Kingdom", "film", "A baker's son is crowned king of a land made entirely of tea-time snacks."],
  ],
  crime: [
    ["Fire Audit", "series", "A forensic accountant traces a warehouse fire back to a decades-old fraud."],
    ["Cold Cases, Pune", "series", "Two mismatched detectives reopen the city's oldest unsolved files."],
    ["Velvet Arithmetic", "film", "A maths professor is drawn into a high-stakes card-counting scheme."],
    ["Port of Quiet Knives", "series", "A dock union leader's murder unravels a port city's alliances."],
    ["The Stenographer's Draft", "film", "A court stenographer realises the testimony she typed was rehearsed."],
    ["Brass Lanterns", "series", "A family of antique dealers is a front for something far more valuable."],
    ["Sketches Before Midnight", "film", "A police sketch artist starts drawing faces of crimes before they happen."],
    ["Dust Road Patrol", "series", "A rookie constable is posted to the quietest, and most dangerous, desert district."],
  ],
};

const FIRST = ["Aarav", "Meera", "Kabir", "Ishita", "Rohan", "Tara", "Vikram", "Anaya", "Dev", "Nisha", "Arjun", "Zoya", "Siddharth", "Kavya", "Farhan", "Leela", "Neel", "Radhika", "Imran", "Pooja", "Aditya", "Sana", "Kunal", "Revathi", "Manav", "Tanvi", "Yash", "Aditi", "Omkar", "Gauri"];
const LAST = ["Menon", "Bhatt", "Kulkarni", "Sethi", "Iyer", "Chatterjee", "Rathore", "D'Souza", "Naidu", "Grewal", "Banerjee", "Pillai", "Kapadia", "Mirza", "Hegde", "Saxena", "Bora", "Thakkar", "Rao", "Lobo"];
const EPISODE_WORDS = ["The Long Corridor", "Low Tide", "Small Hours", "What the River Kept", "Paper Trail", "Second Chances", "The Visitor", "Static", "Open Window", "Homecoming", "A Quiet Deal", "Old Debts", "First Light", "The Crossing", "Loose Threads", "Echoes", "Night Market", "The Offer", "Broken Compass", "Arrivals", "Counterweight", "Blue Hour", "The Inventory", "Last Orders", "Smoke Signals", "Fault Lines", "Tidewater", "The Long Way Round", "Undertow", "Full Circle"];
const LANGS = ["Hindi", "Tamil", "Malayalam", "Bengali", "Marathi", "Telugu", "Kannada", "English"];
const MATURITY: Record<GenreId, string[]> = {
  drama: ["U/A 13+", "U/A 16+"], thriller: ["U/A 16+", "A"], comedy: ["U/A 7+", "U/A 13+"], scifi: ["U/A 13+", "U/A 16+"],
  romance: ["U/A 13+", "U/A 7+"], documentary: ["U", "U/A 7+"], family: ["U", "U"], crime: ["A", "U/A 16+"],
};
/** Poster palettes per genre: [from, to, ink]. */
export const PALETTES: Record<GenreId, [string, string, string][]> = {
  drama: [["#3b2a4f", "#c98b5b", "#fdf1e2"], ["#1f3a3d", "#d7a86e", "#fbf3e6"], ["#4a2c2a", "#e1b07e", "#fff4e6"]],
  thriller: [["#0f1d2b", "#3e7c8f", "#e6f6f8"], ["#1b1b2f", "#5a6fb5", "#eef0ff"], ["#10251f", "#5e9e7a", "#eafaf0"]],
  comedy: [["#f2b84b", "#f07b5a", "#2a1508"], ["#9fd4c4", "#f5d36b", "#1d2a24"], ["#f7a8b8", "#ffd27a", "#33161e"]],
  scifi: [["#120f2e", "#6a4fd8", "#efeaff"], ["#081c2c", "#2fb3c0", "#e2fbff"], ["#1a0f24", "#c05fd1", "#fbeaff"]],
  romance: [["#5a1f3d", "#f29f8f", "#fff0ec"], ["#3d2347", "#f4b6c8", "#fff1f6"], ["#2e2a4f", "#f6c28b", "#fff6ea"]],
  documentary: [["#22311f", "#a9b86b", "#f4f7e6"], ["#2a2318", "#c6a163", "#fbf4e4"], ["#13262e", "#7fb2b0", "#e9f7f6"]],
  family: [["#4fb3a9", "#f6d36b", "#16302c"], ["#7aa7f0", "#f9c6a0", "#1a2440"], ["#9b84e8", "#ffd7a8", "#231b42"]],
  crime: [["#1c1a1a", "#8c6a3f", "#f6ead8"], ["#141a22", "#6b7d8f", "#e8eef4"], ["#24161a", "#9a5b52", "#f8e7e2"]],
};

export type Episode = { n: number; title: string; minutes: number; synopsis: string };
export type Season = { n: number; year: number; episodes: Episode[] };
export type Title = {
  id: string; title: string; kind: "film" | "series"; genre: GenreId; logline: string; synopsis: string;
  year: number; maturity: string; language: string; rating: number; ratingCount: number;
  minutes: number; seasons: Season[]; cast: string[]; creator: string; palette: [string, string, string];
  shape: number; quality: "HD" | "4K";
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const pick = <T,>(r: () => number, a: readonly T[]) => a[Math.floor(r() * a.length)];
const person = (r: () => number) => `${pick(r, FIRST)} ${pick(r, LAST)}`;

function build(genre: GenreId, [title, kind, logline]: Seed): Title {
  const id = slug(title);
  const r = prng(`reelbox:${id}`);
  const year = 2016 + Math.floor(r() * 10);
  const cast = Array.from(new Set(Array.from({ length: 6 }, () => person(r)))).slice(0, 5);
  const seasonsCount = kind === "series" ? 1 + Math.floor(r() * 3) : 0;
  const seasons: Season[] = Array.from({ length: seasonsCount }, (_, s) => ({
    n: s + 1,
    year: Math.min(2026, year + s),
    episodes: Array.from({ length: 6 + Math.floor(r() * 5) }, (_, e) => ({
      n: e + 1,
      title: pick(r, EPISODE_WORDS),
      minutes: 32 + Math.floor(r() * 26),
      synopsis: `${pick(r, ["A setback forces", "An old friend pushes", "A discovery leads", "A deadline drives", "A quiet evening sends"])} the ${pick(r, ["family", "team", "pair", "crew", "neighbours"])} ${pick(r, ["to choose sides", "into unfamiliar territory", "to revisit the past", "towards a risky plan", "to rethink everything"])}.`,
    })),
  }));
  return {
    id, title, kind, genre, logline,
    synopsis: `${logline} ${kind === "series" ? `Told over ${seasonsCount} season${seasonsCount > 1 ? "s" : ""},` : "Across one long night and the days that follow,"} ${pick(r, ["it is a story about what people owe each other.", "it asks how much of the past we can carry.", "it balances warmth with real stakes.", "it rewards patience with a finale worth the wait.", "it finds humour in the most unlikely places."])}`,
    year, maturity: pick(r, MATURITY[genre]), language: pick(r, LANGS),
    rating: Math.round((3.6 + r() * 1.2) * 10) / 10, ratingCount: 800 + Math.floor(r() * 42000),
    minutes: kind === "film" ? 92 + Math.floor(r() * 58) : 0,
    seasons, cast, creator: person(r), palette: pick(r, PALETTES[genre]), shape: Math.floor(r() * 3),
    quality: r() > 0.45 ? "4K" : "HD",
  };
}

export const TITLES: Title[] = GENRES.flatMap((g) => SEEDS[g.id].map((s) => build(g.id, s)));
export const titleById = (id: string) => TITLES.find((t) => t.id === id);
export const titlesByGenre = (g: GenreId) => TITLES.filter((t) => t.genre === g);
export const genreName = (g: GenreId) => GENRES.find((x) => x.id === g)!.name;

export const FEATURED_ID = "monsoon-protocol";

/** The demo account's watch history (fixed, so the rail renders identically for everyone). */
export const CONTINUE_WATCHING: { id: string; progress: number; label: string }[] = [
  { id: "the-salt-ledger", progress: 0.62, label: "S1 · E4" },
  { id: "copper-sky-colony", progress: 0.18, label: "S2 · E1" },
  { id: "velvet-arithmetic", progress: 0.44, label: "52 min left" },
  { id: "rivers-that-remember", progress: 0.81, label: "S1 · E5" },
  { id: "uncle-chintu-has-opinions", progress: 0.3, label: "S1 · E2" },
  { id: "marigold-summer", progress: 0.55, label: "S1 · E7" },
];

export const runtime = (t: Title) =>
  t.kind === "film" ? `${Math.floor(t.minutes / 60)}h ${t.minutes % 60}m` : `${t.seasons.length} season${t.seasons.length > 1 ? "s" : ""}`;

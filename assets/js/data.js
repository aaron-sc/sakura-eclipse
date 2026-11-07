/* ==========================================================================
   Sakura Eclipse — Org data
   Single source of truth for games + rosters, consumed by index.html,
   teams.html, and player.html. Edit here to update the whole site.

   Player fields: name, handle (required-ish — leave "" if unknown), and
   optionally platform (e.g. "Twitch", shown as "handle (Platform)"),
   captain (true shows a "C" badge), igl (true shows an "IGL" badge).

   To add facts/bio to a player later, just add fields to their object
   in a team's `roster` or `subs` array, e.g.:
     { name: "zeil", handle: "zeil_val", platform: "Twitch", captain: true,
       bio: "IGL, been with the org since season 1.",
       facts: ["Plays Jett/Chamber", "Also streams on Twitch"] }
   player.html picks up `bio` and `facts` automatically if present.
   ========================================================================== */

const DISCORD_HQ_URL = "https://discord.gg/PthEkdVx4A";
const DISCORD_COMMUNITY_URL = "https://discord.gg/mbAD7JReWQw";

const GAMES = [
  {
    id: "valorant",
    name: "VALORANT",
    badge: "VAL",
    blurb: "Tactical 5v5 shooter — precision utility and clutch-factor gunplay.",
    teams: [
      {
        name: "Sakura Eclipse Astrals",
        tier: "Main Roster",
        roster: [
          { name: "Zeil", handle: "", captain: true },
          { name: "Musuo", handle: "" },
          { name: "Tokyo", handle: "" },
          { name: "Prince", handle: "" },
          { name: "MoIzwn", handle: "" }
        ],
        subs: [
          { name: "Soriya", handle: "" },
          { name: "Bubble", handle: "" }
        ]
      },
      {
        name: "Sakura Eclipse",
        tier: "Secondary Roster",
        roster: [
          { name: "Bhsalty", handle: "" },
          { name: "Gigaberry", handle: "" }
        ]
      },
      {
        name: "Sakura Eclipse nova",
        tier: "Tertiary Roster",
        roster: [
          { name: "Tanuki", handle: "" },
          { name: "Shadi", handle: "" },
          { name: "Ukiyo", handle: "" }
        ],
        subs: [
          { name: "Trex", handle: "" },
          { name: "Night", handle: "" }
        ]
      },
      {
        name: "Sakura Eclipse Lunar",
        tier: "Academy Roster",
        roster: [
          { name: "Buds", handle: "" },
          { name: "Royal", handle: "" },
          { name: "Kyro", handle: "" },
          { name: "Zigz", handle: "" },
          { name: "Scaffold", handle: "" },
          { name: "Jona", handle: "" },
          { name: "Swaggy", handle: "", captain: true }
        ]
      }
    ]
  },
  {
    id: "r6",
    name: "Rainbow Six Siege",
    badge: "R6",
    blurb: "Our deepest pipeline — six rosters spanning open, all-ages, and U18 play.",
    teams: [
      { name: "Sakura Eclipse", tier: "Main Roster" },
      {
        name: "Sakura Eclipse Vanguard",
        tier: "Secondary Roster",
        roster: [
          { name: "Bili", handle: "" },
          { name: "Recoil", handle: "" },
          { name: "Snow", handle: "" },
          { name: "Pokey", handle: "" }
        ]
      },
      { name: "Sakura Eclipse ELITE", tier: "All-Ages Roster" },
      {
        name: "Sakura Eclipse Moon",
        tier: "U18 Main Roster",
        roster: [
          { name: "Stumpy", handle: "" },
          { name: "Shadow", handle: "" },
          { name: "Slinky", handle: "" },
          { name: "Ghostly", handle: "" },
          { name: "Koszmar", handle: "" }
        ],
        subs: [{ name: "Skylar", handle: "" }]
      },
      {
        name: "Sakura Eclipse SUN",
        tier: "U18 Secondary Roster",
        roster: [
          { name: "Atlast", handle: "" },
          { name: "s03py", handle: "" },
          { name: "sniper", handle: "" }
        ],
        subs: [{ name: "suburbanthug", handle: "" }]
      },
      { name: "Sakura Eclipse ACAD", tier: "Academy Roster" }
    ]
  },
  {
    id: "apex",
    name: "Apex Legends",
    badge: "APEX",
    blurb: "Battle royale trios — rotations, third-party timing, and clutch resets.",
    teams: [
      {
        name: "Sakura Eclipse",
        tier: "Main Roster",
        roster: [
          { name: "Xyfar", handle: "" },
          { name: "Mizuki", handle: "" },
          { name: "lost", handle: "" }
        ]
      }
    ]
  },
  {
    id: "cs2",
    name: "Counter-Strike 2",
    badge: "CS2",
    blurb: "Round-based competitive FPS at the highest level of precision.",
    teams: [{ name: "Sakura Eclipse", tier: "Main Roster" }]
  },
  {
    id: "overwatch",
    name: "Overwatch 2",
    badge: "OW",
    blurb: "Hero-shooter team fights built on coordination, comps, and swaps.",
    teams: [{ name: "Sakura Eclipse", tier: "Main Roster" }]
  },
  {
    id: "rocketleague",
    name: "Rocket League",
    badge: "RL",
    blurb: "High-octane car soccer — mechanics, rotation, and boost control.",
    teams: [{ name: "Sakura Eclipse", tier: "Main Roster" }]
  }
];

const TOTAL_TEAMS = GAMES.reduce((sum, g) => sum + g.teams.length, 0);

function formatHandle(p) {
  if (!p.handle) return "";
  return p.platform ? p.handle + " (" + p.platform + ")" : p.handle;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function playerSlug(gameId, teamName, playerName) {
  return gameId + "--" + slugify(teamName) + "--" + slugify(playerName);
}

// Looks up a player by their URL slug (see playerSlug above). Returns
// { game, team, player, teammates } — teammates is the full roster+subs
// list of the same team, each tagged with isSub — or null if not found.
function findPlayerBySlug(slug) {
  for (var gi = 0; gi < GAMES.length; gi++) {
    var g = GAMES[gi];
    for (var ti = 0; ti < g.teams.length; ti++) {
      var t = g.teams[ti];
      var roster = (t.roster || []).map(function (p) {
        return Object.assign({ isSub: false }, p);
      });
      var subs = (t.subs || []).map(function (p) {
        return Object.assign({ isSub: true }, p);
      });
      var all = roster.concat(subs);
      for (var pi = 0; pi < all.length; pi++) {
        if (playerSlug(g.id, t.name, all[pi].name) === slug) {
          return { game: g, team: t, player: all[pi], teammates: all };
        }
      }
    }
  }
  return null;
}

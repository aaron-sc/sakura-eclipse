# Sakura Eclipse — Esports Org Website

Static site (HTML/CSS/JS only, no build step) for Sakura Eclipse.

## Structure

```
index.html          Home page (hero, about, games overview, Discord CTA)
teams.html           Full, filterable roster listing for every team
player.html           Individual player profile (linked from teams.html)
404.html              Custom not-found page
assets/css/style.css   All styles
assets/js/data.js       Games + rosters + player lookup helpers — edit this to add/rename teams or players
assets/js/main.js       Site behavior (nav, animations, filtering, etc.)
assets/js/player.js     Renders a player's profile from the ?p= URL param
assets/img/newlogo.png     Org logo (used as favicon, nav mark, hero mark)
```

## Editing rosters

Everything about games, teams, and players lives in one place: [assets/js/data.js](assets/js/data.js).
Add, rename, or remove a team by editing the `GAMES` array — both the homepage
games grid and the `teams.html` filtered listing pull from this file automatically.

Each team can optionally have a `roster` array and a `subs` array. Each player
is `{ name, handle, captain? }` — click a player's name on `teams.html` to open
their profile page. To add more detail to a specific player later, just add
`bio` (a string) and/or `facts` (an array of short strings) to their object:

```js
{ name: "zeil", handle: "@Z3ilTwitch", captain: true,
  bio: "IGL, been with the org since season 1.",
  facts: ["Plays Jett/Chamber", "Also streams on Twitch"] }
```

`player.html` picks these up automatically — no other changes needed. Players
without a `roster`/`subs` entry yet just show "Roster announcement pending"
on the team card, same as before.

Player profile links are generated from the game, team name, and player name,
so renaming a player or team changes their URL — that's expected for a small
org site, but keep in mind old shared links will 404 after a rename.

## Editing the Discord link

Update the `DISCORD_URL` constant at the top of `assets/js/data.js`. It's used
everywhere Discord is linked or copied.

## Running locally

No build step needed — just serve the folder. From this directory:

```
python -m http.server 8000
```

then open `http://localhost:8000`.

## Deploying to GitHub Pages

1. Push this repo to GitHub (branch `main`).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Set branch to `main` and folder to `/ (root)`, then **Save**.
5. GitHub will publish the site at `https://<username>.github.io/<repo-name>/`
   within a minute or two.

No further configuration is required — this is a plain static site.

# Keeper Word Quest

A fan-made **word-search** game inspired by Shannon Messenger’s *Keeper of the Lost Cities* series.

**50 creative themes** · offline PWA · vanilla HTML/CSS/JS · iPad-friendly

> Unofficial fan project. Not affiliated with the author, publisher, or rights holders.

## Play locally

```bash
cd KeeperWordQuest
python3 -m http.server 8080
```

Open `http://localhost:8080` (or your Mac’s IP on an iPad).  
Safari → **Share → Add to Home Screen** for standalone play.

## Puzzle themes (50)

Characters, places, abilities, factions, families, culture, and story arcs — including Sophie, Foxfire, Black Swan, Neverseen, Silveny, light leaping, Cognates, Atlantis, Eternalia, and more.

## Files

| File | Role |
|------|------|
| `index.html` | Screens & UI shell |
| `style.css` | Lost Cities palette, high contrast |
| `game.js` | 50 puzzles, generator, progress, PWA |
| `manifest.json` / `sw.js` | Installable offline app |
| `icons/` | App icons |

Progress is stored in `localStorage` under `kwq.*` keys (separate from WordQuest Girls).

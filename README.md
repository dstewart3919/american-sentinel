# American Sentinel

Interactive 3D US map (Three.js) showing state party colors and elected officials (Governor, Senators, House).

Also displays key administration officials and basic US economic metrics.

**Live site:** https://dstewart3919.github.io/american-sentinel/

GitHub Pages serves this repo from the `master` branch root. No build step. Push to `master` and the site updates.

## Structure

- `index.html` — Main page
- `app.js` — Three.js scene, map, interactions, data loading
- `data/` — JSON data files (gov/sen, house, president team, state outlines)
- `images/` — Official photos and assets

## Local development

Open `index.html` with a simple static server (fetch needs http, not `file://`).

```bash
python3 -m http.server 8080
```

## Data

Officials data is in the JSON files under `data/`. Images are referenced by path in the JSON. Missing portraits use `images/portrait-fallback.svg`.

AIPAC figures are FEC filings for 2022, 2024, and 2026 combined. "Direct" is AIPAC PAC (`C00797670`) contributions to the campaign. "UDP for" and "UDP against" are independent expenditures by AIPAC's super PAC, United Democracy Project (`C00799031`). `$0` means those committees reported nothing for that person in those cycles, not that no pro-Israel donor ever gave.

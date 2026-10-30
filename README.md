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

AIPAC career totals are tracked pro-Israel PAC money through September 5, 2026. On October 21, 2026 AIPAC stopped endorsements, direct PAC checks, and earmarks. The channel that still spends is its super PAC, United Democracy Project. Cards show that 2026 for-or-against spending on its own line. It is not added on top of the career total. A Jewish or Muslim tie is shown only when a public biography states that faith.

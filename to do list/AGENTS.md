# AI Agent Instructions for this Workspace

## Project overview
- Static frontend web app in a single-page layout.
- Files: `index.html`, `style.css`, `script.js`.
- No build tool, package manager, or test suite is present.
- App state is stored in browser `localStorage` under keys like `devos_horizon_v7` and `devos_front_geo_v7`.
- Uses CDN scripts/styles for InteractJS and Font Awesome.

## What agents should know
- Do not assume a JS framework or bundler; changes should be made directly to the existing HTML/CSS/JS files.
- Keep the core page structure in `index.html` and avoid adding server-side or Node.js-specific code.
- `script.js` contains app rendering, widget creation, drag/drop interaction, and localStorage persistence.
- `style.css` defines layout, panels, widgets, and overall theme styling.

## Helpful guidance
- Focus on preserving existing UI interactions, app state behavior, and panel toggles.
- If adding new functionality, update all three files as needed and test by opening `index.html` in a browser.
- Keep the application lightweight and avoid introducing unnecessary build complexity.

## Useful file references
- `index.html` — main markup and entrypoint
- `style.css` — styling and layout
- `script.js` — application logic, rendering, and persistence

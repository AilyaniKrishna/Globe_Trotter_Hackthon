# Voyagera / GlobeTrotter

A complete, dependency-free full-stack travel planning app built from the supplied GlobeTrotter brief and wireframes.

## Run it

1. No setup option: open `public/index.html` directly in a browser. It works offline and saves changes in that browser's local storage.
2. Optional backend option: double-click `Start-Voyagera.bat`. Keep the opened command window running while using the site.
3. Alternatively, in this folder run `node server.js`, then open `http://127.0.0.1:3000`.
3. Log in with `alex@voyagera.app` / `demo123`, or register a new user.

## Included

- Responsive frontend dashboard, authentication, trip list, create-trip form, itinerary and budget screens
- City/activity discovery, community tips, travel calendar, profile screen, and admin analytics
- Node.js HTTP API plus a persisted JSON database (`data.json`) initialized automatically at first launch
- Working register/login, trip creation, adding itinerary activities, community posts, filtering, and budget recalculation

The JSON datastore makes the project runnable with no install step. It can be migrated to SQLite/PostgreSQL for deployment by replacing the small database helpers in `server.js`.

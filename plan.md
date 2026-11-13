# SnowWatch Montgomery County

## Product scope

SnowWatch is a transparent Montgomery County, Pennsylvania school-weather dashboard. It combines a live public weather forecast with a district-by-district source registry. Forecast risk is always visually separate from confirmed district operating announcements. The first version uses the supplied Montgomery County school district map as the map visual, shows district markers and a searchable district list, supports Open, 2-hour delay, Closed, and Not announced states, and links each district to its official notice page.

The initial implementation uses the National Weather Service public API from the browser for a central Montgomery County forecast. Because district sites do not expose one consistent browser API, official notices are represented as source links and clearly marked as unconfirmed until a future server-side source checker is added. The UI includes explicit unavailable-data and freshness states so a missing notice is not presented as an open school day.

## Project structure

- `client/src/pages/Home.tsx`: dashboard state, district source registry, weather fetch, map interactions, filters, and status/detail views.
- `client/src/index.css`: SnowWatch visual system, responsive layout, map overlay styling, status/risk treatments, and accessibility states.
- `client/public/manus-routes.json`: published route manifest for the single-page dashboard.
- `server/_core/index.ts`: retained starter server and health endpoint; available for a future server-side notice fetcher and scheduled refresh worker.
- `plan.md` and `TODO.md`: product/design decisions and outcome tracking.

## Design direction

### Considered styles

- **Nordic storm desk** (0.06): quiet paper surfaces, weather-map blues, and signal amber for operational urgency.
- **Civic utility board** (0.07): dense municipal information layout with high-contrast status colors and restrained ornament.
- **Snow-day newsroom** (0.04): editorial headlines, timestamp rails, and source-first information hierarchy.

### Chosen direction: Nordic storm desk

- **Design Movement:** editorial weather operations UI with the calm precision of a Nordic forecast desk.
- **Core Principles:** calm before alarm; every decision has a source; forecast and official notice never share the same visual treatment; information density should remain scannable.
- **Color Philosophy:** ink navy anchors trust, ice blue carries live weather context, warm amber flags forecast risk, and coral is reserved for confirmed closures. Off-white surfaces keep the product approachable during a stressful morning.
- **Layout Paradigm:** a wide instrument panel with a map on the left, a live intelligence rail on the right, and a source-forward district ledger below; avoid a generic centered marketing hero.
- **Signature Elements:** thin weather-front contour lines, compact monospaced timestamps, and split badges that pair a status label with a provenance cue.
- **Interaction Philosophy:** selecting a map marker focuses the corresponding district card; filters update map and ledger together; official source links are always one click away.
- **Animation:** subtle marker pulse only for live weather refresh; no looping decorative motion; focus and selection transitions are short and directional.
- **Typography System:** Fraunces for display headlines, IBM Plex Sans for interface text, and IBM Plex Mono for timestamps, counts, and source metadata.
- **Brand Essence:** a clear snow-day signal for Montgomery County families; calm, accountable, local.
- **Brand Voice:** “Forecast risk is not a closure notice.” and “Check the district source before you leave.”
- **Wordmark & Logo:** a compact snowflake inside a rounded square, paired with a small county-coordinate readout.
- **Signature Brand Color:** `#9DD7E6`, an icy cyan used for the live-feed rail and selected district state.

## Implementation decisions

- Keep the first release public and login-free.
- Load central Montgomery County weather from NWS `api.weather.gov`; if the request fails, show a timestamped fallback and never imply the data is live.
- Use source links for districts, with Souderton Area School District as the explicit example source.
- Default all official district statuses to Not announced. Forecast risk is derived from the live forecast and is not used to set an official status.
- Use the supplied raster district map as a visual reference, augmented by selectable markers and the searchable list rather than attempting to infer clickable geographic boundaries from the raster.

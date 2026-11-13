# SnowWatch Montgomery County — TODO

## Dashboard and weather feed

- [x] Show a current storm summary with observed conditions, forecast timing, estimated snowfall, and the latest weather-data update time.
  - The dashboard loads a central Montgomery County forecast from the National Weather Service public API.
  - The UI shows live/fallback state, temperature, condition, estimated snow, forecast timing, and a source timestamp.
- [x] Keep weather-based predictions explicitly separate from official operating announcements.
  - Forecast risk uses amber/blue risk treatments.
  - Confirmed operating status uses separate status badges and is never inferred as official from the forecast.

## District map and list

- [x] Display Montgomery County districts over the supplied map visual with selectable district markers.
  - The map uses the provided Montgomery County school district map asset.
  - Markers focus the selected district and open the same detail context as the list.
- [x] Provide a compact district list with filters for confirmed status and weather-risk level.
  - List search, status filter, and risk filter update the district ledger and marker visibility.
- [x] Support Open, 2-hour delay, Closed, and Not announced labels with a clear legend.
  - Not announced is the default official state until a source-backed notice is available.

## Sources and transparency

- [x] Provide a district detail view with local weather context, estimated snowfall, status context, source-freshness state, and a direct official notice link.
  - Every district seed includes an official source URL and source label.
- [x] Include a source registry and freshness/disclaimer language.
  - NWS and district source cards are visible in the Sources section.
  - The UI states that forecast risk is not an official closure decision and that district pages remain authoritative.
- [ ] Add a server-side scheduled source checker that normalizes official notices into confirmed status records.
  - Deferred beyond the first UI prototype because district websites do not expose one uniform public API.

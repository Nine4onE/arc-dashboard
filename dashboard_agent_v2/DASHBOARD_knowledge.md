# DASHBOARD AGENT — KNOWLEDGE FILE
## Arc iOS Dashboard — Technical Reference
Version 2 | June 4, 2026

---

## 1. CSS VARIABLE MAP

```css
:root {
  --bg: #0a0a0a;         /* page background */
  --surface: #111;        /* card background */
  --border: #1e1e1e;      /* card borders */
  --text: #f0f0f0;        /* primary text */
  --muted: #888;          /* secondary text, labels */
  --dim: #3a3a3a;         /* very dim, footer text */
  --accent: #378ADD;      /* primary accent, blue */

  /* Block colors — schedule, habit theming */
  --work: #378ADD;        /* work blocks */
  --gym: #639922;         /* gym / green */
  --admin: #BA7517;       /* admin / amber */
  --rest: #7F77DD;        /* rest / purple */
  --venture: #D4537E;     /* venture / pink */
  --garden: #3B6D11;      /* garden / dark green */
  --neutral: #444;        /* neutral blocks */

  /* Safe area — iOS notch + home bar */
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}
```

---

## 2. LOCALSTORAGE KEY SCHEMA

| Key pattern | Type | Description |
|---|---|---|
| `habit_{h}` | JSON `{date, done}` | Today's habit state |
| `streak_{h}` | String (int) | Current streak for habit h |
| `habitday_{h}_{YYYY-M-D}` | `'1'` | Per-day habit completion (heatmap) |
| `waterhabit_{YYYY-M-D}` | String (0/1/2) | Water habit phase (0=none, 1=half, 2=done) |
| `mits_{YYYY-M-D}` | JSON `{tasks:[],done:[]}` | Daily MITs (3 items) |
| `tasks_{YYYY-M-D}` | JSON `{items:[],done:[]}` | Daily tasks (3 items) |
| `water_{YYYY-M-D}` | String (int) | Water glass count |
| `review_{YYYY-WW}` | JSON array of ints | Weekly review completed item indices |
| `venture_ideas` | JSON array | All captured venture ideas |
| `grow_trays` | JSON array | All grow tray records |
| `arc_bin_id` | String | JSONBin bin ID |
| `arc_api_key` | String | JSONBin API key |
| `arc_alarms_off` | `'0'` or `'1'` | Alarm toggle state |
| `cre_habit_{h}` | JSON `{date, done}` | CRE tab habit state |
| `cre_streak_{h}` | String (int) | CRE habit streak |

**Habit keys (h values):** gym, work, rest, intake, tasks, chill, hz, water, selfcare

**CRE habit keys:** learn, listings, pulse

**Date key format:** `todayKey()` returns `YYYY-M-D` (no zero-padding)
**Week key format:** `YYYY-WW` (ISO week number)

---

## 3. JSONBIN SYNC PAYLOAD STRUCTURE

```javascript
{
  habits: {
    [h]: {
      state: { date, done },
      streak: int,
      // + day_{YYYY-M-D}: '1' for each of last 90 days
    }
  },
  mits: { tasks: [], done: [] },
  tasks: { items: [], done: [] },
  water: '0',
  review: [],
  reviewKey: 'YYYY-WW',
  venture_ideas: []
}
```

JSONBin endpoint: `https://api.jsonbin.io/v3/b/{JSONBIN_BIN_ID}`
- GET: retrieve latest record
- PUT: update record (full payload replace)
- Header: `X-Master-Key: {JSONBIN_API_KEY}`

---

## 4. TAB INVENTORY

### TODAY
- Clock (live, updates every second) + weather summary (temp + description)
- Date line
- Habits grid (3-col): Gym, Work, Rest, Intake, Tasks, Chill, Hz, Water (fill animation), Self-care
- MITs (3 inputs + checkboxes, date-keyed, reset button)
- Tasks (3 inputs + checkboxes, date-keyed, reset button)
- Water intake (bottle-based click system, 3 bottles × 3 glasses = 9 total)
- Schedule (time blocks with active row highlight, alarm toggle)
- GitHub push button (copies terminal command)

### POMO
- Pomodoro timer (25/5 work-break cycle)
- MIT selector — pulls live MITs from Today tab
- Focus session tracking

### PROGRESS
- Heatmap tabs: Gym / Work / MIT (switchable)
- 90-day habit heatmap grid
- Year progress bar

### GROW
- Tray management: add trays, track grow days, daily tasks per tray
- Task types: mist, water check, drip check, harvest window
- Tray status: active / harvest / done

### REVIEW
- Weekly review checklist (fixed items, week-keyed)
- Reset button

### WEATHER
- 5-day forecast grid
- Weather detail cards: humidity, wind, UV index
- Sunrise/sunset cards
- Hourly scroll (horizontal)
- All from open-meteo, Roseville CA coordinates

### VENTURE
- Idea capture textarea
- Tag selector: Product / Service / System
- Idea list with delete, timestamp, tag color coding

### CRE
- CRE daily habits: Daily Learn, Listings, Market Pulse (with streaks)
- MOB listings tracker (Hot / Warm / Cold status)
- Market pulse rows
- Brokerage tracker (stage-based)
- Daily learn entry
- Collapse/expand sections

### 1908 (LFRO)
- 1908 Exchange referral tab — content TBD / in development

---

## 5. SCHEDULE BLOCK SYSTEM

Schedule rows are defined in JS with:
```javascript
{ time: '6:00 AM', label: 'Gym', color: 'var(--gym)', end: '7:30 AM' }
```
Active row is highlighted based on current PT time. Schedule is static (defined in code, not localStorage).

Color mapping:
- Gym → `--gym` (#639922)
- Work → `--work` (#378ADD)
- Admin → `--admin` (#BA7517)
- Rest → `--rest` (#7F77DD)
- Venture → `--venture` (#D4537E)
- Garden → `--garden` (#3B6D11)

---

## 6. OPEN-METEO API

```
https://api.open-meteo.com/v1/forecast
  ?latitude=38.7521
  &longitude=-121.2880
  &current=temperature_2m,weathercode,relative_humidity_2m,windspeed_10m,winddirection_10m,uv_index
  &hourly=temperature_2m,weathercode
  &daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset
  &temperature_unit=fahrenheit
  &windspeed_unit=mph
  &timezone=America%2FLos_Angeles
  &forecast_days=5
```

Free, no API key. Returns JSON. Weather codes map to emoji/descriptions in `getWeatherDesc(code)`.

---

## 7. IOS / SAFARI CONSTRAINTS

| Constraint | Rule |
|---|---|
| Buttons | Always `-webkit-appearance: none` |
| Scroll lists | `-webkit-overflow-scrolling: touch` + `scrollbar-width: none` |
| Tap flash | `-webkit-tap-highlight-color: transparent` on `*` |
| Safe area | `padding-top: calc(var(--safe-top) + 14px)` on body |
| Home bar | `padding-bottom: calc(var(--safe-bottom) + 16px)` on body |
| Inputs | `font-size: 13px minimum` — below 16px triggers iOS auto-zoom on focus |
| Position fixed | Avoid inside scrollable containers — iOS scroll bugs |
| Viewport | `maximum-scale=1.0, user-scalable=no` — prevents pinch zoom |

---

## 8. GITHUB DEPLOYMENT

- Repo: `nine4one/arc-dashboard` (GitHub Pages)
- Live URL: `https://nine4one.github.io/arc-dashboard/`
- File: `index.html` (single file)
- Push: user copies terminal command from Push button in dashboard, runs in Terminal
- Icon: `icon.png` at repo root — used for home screen app icon

---

## 9. DESIGN TOKENS QUICK REFERENCE

| Token | Value | Use |
|---|---|---|
| Card radius | `11px` | Outer cards |
| Inner card radius | `10px` | Nested cards, list items |
| Pill radius | `20px` | Badges, tabs, buttons |
| Tag radius | `4px` | Small type tags |
| Card padding | `10–14px` | Standard card interior |
| Gap | `7px` | Grid and flex gaps |
| Section margin | `10px` | Between sections |
| Label font size | `10px` | Section labels, card labels |
| Value font size | `13px` | Card values |
| Body font size | `14px` | Base |
| Input font size | `13px` | MIT inputs, task inputs |

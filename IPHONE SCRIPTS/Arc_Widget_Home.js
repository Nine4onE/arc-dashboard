// ARC HOME SCREEN WIDGET
// Version 1.0 — Session 3
// Shows: clock, current block, countdown, habits, weather

// ─── CONFIG ───────────────────────────────────────────
const WEATHER_LAT = 38.7521;
const WEATHER_LON = -121.2880;
const TIMEZONE = "America/Los_Angeles";

// Colors
const BG = new Color("#0a0a0a");
const SURFACE = new Color("#111111");
const BORDER = new Color("#1e1e1e");
const TEXT = new Color("#f0f0f0");
const MUTED = new Color("#555555");
const ACCENT = new Color("#378ADD");
const GYM = new Color("#639922");
const WORK = new Color("#378ADD");
const REST = new Color("#7F77DD");
const INTAKE = new Color("#BA7517");
const TASKS = new Color("#0D9488");
const CHILL = new Color("#D4537E");

// ─── SCHEDULE ─────────────────────────────────────────
const schedule = [
  { time: "05:30", label: "Wake up + Arc briefing", color: MUTED },
  { time: "05:45", label: "MED-CAB water", color: GYM },
  { time: "06:00", label: "Gym", color: GYM },
  { time: "07:30", label: "Shower + breakfast", color: MUTED },
  { time: "08:30", label: "Set 3 MITs", color: MUTED },
  { time: "09:00", label: "MIT #1 — eat the frog", color: WORK },
  { time: "10:30", label: "Admin + Tasks #1", color: INTAKE },
  { time: "11:00", label: "MIT #2", color: WORK },
  { time: "12:00", label: "Admin + Tasks #2", color: INTAKE },
  { time: "12:30", label: "Lunch", color: MUTED },
  { time: "13:30", label: "MIT #3", color: WORK },
  { time: "14:30", label: "Admin + Tasks #3", color: INTAKE },
  { time: "15:00", label: "Personal time", color: REST },
  { time: "18:00", label: "Dinner", color: MUTED },
  { time: "20:00", label: "MED-CAB water", color: GYM },
  { time: "21:00", label: "Night venture block", color: CHILL },
  { time: "22:30", label: "Wind down", color: REST },
  { time: "23:30", label: "Sleep target", color: MUTED },
];

// ─── HELPERS ──────────────────────────────────────────
function toMins(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fmt12(t) {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ap}`;
}

function getPTTime() {
  const now = new Date();
  const pt = new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE }));
  return pt;
}

function getBlock(nowMins) {
  let cur = schedule[0], nxt = schedule[1];
  for (let i = 0; i < schedule.length; i++) {
    if (toMins(schedule[i].time) <= nowMins) {
      cur = schedule[i];
      nxt = schedule[i + 1] || null;
    }
  }
  return { cur, nxt };
}

function todayKey() {
  const n = getPTTime();
  return `${n.getFullYear()}-${n.getMonth() + 1}-${n.getDate()}`;
}

function getHabitDone(habit) {
  const key = `habit_${habit}`;
  const raw = Keychain.contains(key) ? Keychain.get(key) : null;
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    return data.date === todayKey() && data.done;
  } catch { return false; }
}

function getStreak(habit) {
  const key = `streak_${habit}`;
  return Keychain.contains(key) ? parseInt(Keychain.get(key)) || 0 : 0;
}

// ─── WEATHER ──────────────────────────────────────────
async function fetchWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_LAT}&longitude=${WEATHER_LON}&current=temperature_2m,weathercode&temperature_unit=fahrenheit&timezone=${encodeURIComponent(TIMEZONE)}`;
    const req = new Request(url);
    const data = await req.loadJSON();
    return {
      temp: Math.round(data.current.temperature_2m),
      code: data.current.weathercode,
    };
  } catch { return { temp: "--", code: 0 }; }
}

function wDesc(c) {
  if (c === 0) return "Clear";
  if (c <= 2) return "Partly cloudy";
  if (c === 3) return "Overcast";
  if (c <= 49) return "Foggy";
  if (c <= 69) return "Rain";
  if (c <= 79) return "Snow";
  return "Storm";
}

// ─── BUILD WIDGET ─────────────────────────────────────
const weather = await fetchWeather();
const now = getPTTime();
const h = now.getHours(), m = now.getMinutes();
const nowMins = h * 60 + m;
const { cur, nxt } = getBlock(nowMins);
const diff = nxt ? toMins(nxt.time) - nowMins : 0;
const dh = Math.floor(diff / 60), dm = diff % 60;
const countdown = diff <= 0 ? "Now" : dh > 0 ? `${dh}h ${dm}m` : `${dm}m`;

const widget = new ListWidget();
widget.backgroundColor = BG;
widget.setPadding(14, 14, 14, 14);
widget.url = "https://nine4one.github.io/arc-dashboard/Arc_Dashboard_iOS.html";

// ── HEADER ROW
const headerRow = widget.addStack();
headerRow.layoutHorizontally();
headerRow.centerAlignContent();

const logoText = headerRow.addText("ARC");
logoText.font = new Font("Courier", 10);
logoText.textColor = ACCENT;

headerRow.addSpacer();

// Clock
const clockText = headerRow.addText(
  `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`
);
clockText.font = new Font("Courier-Bold", 14);
clockText.textColor = TEXT;

headerRow.addSpacer();

// Weather
const weatherText = headerRow.addText(`${weather.temp}°F`);
weatherText.font = new Font("Courier", 10);
weatherText.textColor = MUTED;

widget.addSpacer(8);

// ── CURRENT BLOCK
const blockLabel = widget.addText("NOW");
blockLabel.font = new Font("Courier", 8);
blockLabel.textColor = MUTED;

const blockText = widget.addText(cur.label);
blockText.font = new Font("Helvetica-Bold", 14);
blockText.textColor = cur.color;
blockText.lineLimit = 1;

widget.addSpacer(4);

// ── NEXT BLOCK
if (nxt) {
  const nextRow = widget.addStack();
  nextRow.layoutHorizontally();

  const nextLabel = nextRow.addText("NEXT  ");
  nextLabel.font = new Font("Courier", 8);
  nextLabel.textColor = MUTED;

  const nextText = nextRow.addText(nxt.label);
  nextText.font = new Font("Helvetica", 11);
  nextText.textColor = MUTED;
  nextText.lineLimit = 1;

  nextRow.addSpacer();

  const countdownText = nextRow.addText(countdown);
  countdownText.font = new Font("Courier-Bold", 11);
  countdownText.textColor = ACCENT;
}

widget.addSpacer(10);

// ── HABITS ROW
const habits = [
  { key: "intake", label: "INT", color: INTAKE },
  { key: "gym", label: "GYM", color: GYM },
  { key: "tasks", label: "TSK", color: TASKS },
  { key: "work", label: "WRK", color: WORK },
  { key: "chill", label: "CHL", color: CHILL },
  { key: "rest", label: "RST", color: REST },
];

const habitRow = widget.addStack();
habitRow.layoutHorizontally();
habitRow.spacing = 4;

for (const habit of habits) {
  const done = getHabitDone(habit.key);
  const streak = getStreak(habit.key);
  const col = habitRow.addStack();
  col.layoutVertically();
  col.centerAlignContent();
  col.backgroundColor = done ? new Color(habit.color.hex, 0.15) : SURFACE;
  col.cornerRadius = 6;
  col.setPadding(4, 4, 4, 4);

  const lbl = col.addText(habit.label);
  lbl.font = new Font("Courier", 7);
  lbl.textColor = done ? habit.color : MUTED;
  lbl.centerAlignText();

  const strk = col.addText(streak > 0 ? `${streak}d` : "--");
  strk.font = new Font("Courier-Bold", 8);
  strk.textColor = done ? habit.color : MUTED;
  strk.centerAlignText();

  habitRow.addSpacer();
}

widget.addSpacer(8);

// ── DAY PROGRESS BAR
const dayPct = Math.round((nowMins / (24 * 60)) * 100);
const progLabel = widget.addText(`Day ${dayPct}%  ·  ${wDesc(weather.code)}`);
progLabel.font = new Font("Courier", 8);
progLabel.textColor = MUTED;

// ─── PRESENT ──────────────────────────────────────────
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();

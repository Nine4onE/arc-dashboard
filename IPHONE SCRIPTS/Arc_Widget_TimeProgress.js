// ARC TIME-PROGRESS WIDGET
// Version 1.0 — Session 3
// Shows animated progress rings for Day, Week, Month, Year

// ─── CONFIG ───────────────────────────────────────────
const TIMEZONE = "America/Los_Angeles";

const BG = new Color("#0a0a0a");
const SURFACE = new Color("#111111");
const TEXT = new Color("#f0f0f0");
const MUTED = new Color("#555555");
const ACCENT = new Color("#378ADD");

const RING_COLORS = {
  day:   new Color("#378ADD"), // blue
  week:  new Color("#639922"), // green
  month: new Color("#BA7517"), // orange
  year:  new Color("#7F77DD"), // purple
};

// ─── HELPERS ──────────────────────────────────────────
function getPTTime() {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE }));
}

function calcProgress() {
  const now = getPTTime();
  const h = now.getHours(), m = now.getMinutes();
  const nowMins = h * 60 + m;

  // Day
  const dayPct = Math.round((nowMins / (24 * 60)) * 100);

  // Week (Sun=0 start)
  const weekMins = now.getDay() * 24 * 60 + nowMins;
  const weekPct = Math.round((weekMins / (7 * 24 * 60)) * 100);

  // Month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthMins = (now.getDate() - 1) * 24 * 60 + nowMins;
  const monthPct = Math.round((monthMins / (daysInMonth * 24 * 60)) * 100);

  // Year
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
  const yearPct = Math.round(((now - startOfYear) / (endOfYear - startOfYear)) * 100);

  return { dayPct, weekPct, monthPct, yearPct };
}

function fmt12h() {
  const now = getPTTime();
  const h = now.getHours(), m = now.getMinutes();
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function dayOfYear() {
  const now = getPTTime();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function weekOfYear() {
  const now = getPTTime();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
}

// ─── DRAW RING ────────────────────────────────────────
function drawRing(ctx, x, y, radius, pct, color, thickness) {
  const size = radius * 2 + thickness * 2;
  const cx = x + radius + thickness;
  const cy = y + radius + thickness;

  // Background ring
  const bgPath = new Path();
  bgPath.addArc(new Point(cx, cy), radius, 0, 2 * Math.PI, false);
  ctx.setLineWidth(thickness);
  ctx.setStrokeColor(new Color("#1e1e1e"));
  ctx.strokePath(bgPath);

  // Progress ring
  if (pct > 0) {
    const endAngle = (-Math.PI / 2) + (2 * Math.PI * pct / 100);
    const progPath = new Path();
    progPath.addArc(new Point(cx, cy), radius, -Math.PI / 2, endAngle, false);
    ctx.setLineWidth(thickness);
    ctx.setStrokeColor(color);
    ctx.strokePath(progPath);
  }
}

// ─── BUILD WIDGET ─────────────────────────────────────
const { dayPct, weekPct, monthPct, yearPct } = calcProgress();
const now = getPTTime();
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const widget = new ListWidget();
widget.backgroundColor = BG;
widget.setPadding(12, 14, 12, 14);
widget.url = "https://nine4one.github.io/arc-dashboard/Arc_Dashboard_iOS.html";

// ── HEADER
const headerStack = widget.addStack();
headerStack.layoutHorizontally();
headerStack.centerAlignContent();

const arcLbl = headerStack.addText("ARC");
arcLbl.font = new Font("Courier-Bold", 9);
arcLbl.textColor = ACCENT;

headerStack.addSpacer();

const timeLbl = headerStack.addText(fmt12h());
timeLbl.font = new Font("Courier", 10);
timeLbl.textColor = TEXT;

headerStack.addSpacer();

const dateLbl = headerStack.addText(`${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}`);
dateLbl.font = new Font("Courier", 9);
dateLbl.textColor = MUTED;

widget.addSpacer(10);

// ── PROGRESS BARS
const entries = [
  { label: "Day",   pct: dayPct,   color: RING_COLORS.day,   sub: `${dayPct}%` },
  { label: "Week",  pct: weekPct,  color: RING_COLORS.week,  sub: `W${weekOfYear()} · ${weekPct}%` },
  { label: "Month", pct: monthPct, color: RING_COLORS.month, sub: `${months[now.getMonth()]} · ${monthPct}%` },
  { label: "Year",  pct: yearPct,  color: RING_COLORS.year,  sub: `${dayOfYear()}/365 · ${yearPct}%` },
];

for (const entry of entries) {
  const row = widget.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  row.spacing = 8;

  // Label
  const lbl = row.addText(entry.label.toUpperCase());
  lbl.font = new Font("Courier", 8);
  lbl.textColor = MUTED;
  lbl.minimumScaleFactor = 0.8;

  // Bar background
  const barStack = row.addStack();
  barStack.layoutHorizontally();
  barStack.backgroundColor = new Color("#1e1e1e");
  barStack.cornerRadius = 2;
  barStack.size = new Size(0, 4);

  const filled = barStack.addStack();
  filled.backgroundColor = entry.color;
  filled.cornerRadius = 2;
  const fillWidth = Math.max(2, Math.round(entry.pct));
  filled.size = new Size(fillWidth, 4);

  barStack.addSpacer();

  row.addSpacer(4);

  // Percentage
  const pctLbl = row.addText(entry.sub);
  pctLbl.font = new Font("Courier-Bold", 8);
  pctLbl.textColor = entry.color;
  pctLbl.minimumScaleFactor = 0.8;

  widget.addSpacer(6);
}

widget.addSpacer(4);

// ── YEAR DOT GRID (mini)
const doy = dayOfYear();
const dotRow = widget.addStack();
dotRow.layoutHorizontally();
dotRow.spacing = 2;

const weeksToShow = 18;
for (let w = weeksToShow; w >= 0; w--) {
  const col = dotRow.addStack();
  col.layoutVertically();
  col.spacing = 2;
  for (let d = 0; d < 7; d++) {
    const dayNum = doy - (w * 7) - d;
    const dot = col.addStack();
    dot.size = new Size(4, 4);
    dot.cornerRadius = 1;
    if (dayNum > 0 && dayNum <= doy) {
      dot.backgroundColor = dayNum === doy ? ACCENT : new Color("#639922", 0.6);
    } else {
      dot.backgroundColor = new Color("#1e1e1e");
    }
  }
}

widget.addSpacer(6);

// ── FOOTER
const footerRow = widget.addStack();
footerRow.layoutHorizontally();

const footerLbl = footerRow.addText(`${now.getFullYear()} · Day ${doy} of 365`);
footerLbl.font = new Font("Courier", 8);
footerLbl.textColor = MUTED;

footerRow.addSpacer();

const yearLbl = footerRow.addText(`${yearPct}% passed`);
yearLbl.font = new Font("Courier-Bold", 8);
yearLbl.textColor = RING_COLORS.year;

// ─── PRESENT ──────────────────────────────────────────
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();

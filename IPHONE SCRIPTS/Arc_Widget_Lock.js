// ARC LOCK SCREEN WIDGET
// Version 1.0 — Session 3
// Accessory Rectangular — shows current block + countdown

// ─── CONFIG ───────────────────────────────────────────
const TIMEZONE = "America/Los_Angeles";

// ─── SCHEDULE ─────────────────────────────────────────
const schedule = [
  { time: "05:30", label: "Wake up" },
  { time: "05:45", label: "MED-CAB water" },
  { time: "06:00", label: "Gym" },
  { time: "07:30", label: "Shower + breakfast" },
  { time: "08:30", label: "Set 3 MITs" },
  { time: "09:00", label: "MIT #1" },
  { time: "10:30", label: "Admin + Tasks #1" },
  { time: "11:00", label: "MIT #2" },
  { time: "12:00", label: "Admin + Tasks #2" },
  { time: "12:30", label: "Lunch" },
  { time: "13:30", label: "MIT #3" },
  { time: "14:30", label: "Admin + Tasks #3" },
  { time: "15:00", label: "Personal time" },
  { time: "18:00", label: "Dinner" },
  { time: "20:00", label: "MED-CAB water" },
  { time: "21:00", label: "Venture block" },
  { time: "22:30", label: "Wind down" },
  { time: "23:30", label: "Sleep" },
];

// ─── HELPERS ──────────────────────────────────────────
function toMins(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getPTTime() {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE }));
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

// ─── BUILD WIDGET ─────────────────────────────────────
const now = getPTTime();
const h = now.getHours(), m = now.getMinutes();
const nowMins = h * 60 + m;
const { cur, nxt } = getBlock(nowMins);
const diff = nxt ? toMins(nxt.time) - nowMins : 0;
const dh = Math.floor(diff / 60), dm = diff % 60;
const countdown = diff <= 0 ? "Now" : dh > 0 ? `${dh}h ${dm}m` : `${dm}m`;

const widget = new ListWidget();
widget.setPadding(4, 6, 4, 6);
widget.url = "https://nine4one.github.io/arc-dashboard/Arc_Dashboard_iOS.html";

// ARC label
const arcLabel = widget.addText("ARC");
arcLabel.font = new Font("Courier-Bold", 8);
arcLabel.textColor = Color.white();

widget.addSpacer(2);

// Current block
const blockText = widget.addText(cur.label.toUpperCase());
blockText.font = new Font("Helvetica-Bold", 11);
blockText.textColor = Color.white();
blockText.lineLimit = 1;

widget.addSpacer(2);

// Next + countdown
if (nxt) {
  const nextRow = widget.addStack();
  nextRow.layoutHorizontally();

  const nextText = nextRow.addText(nxt.label);
  nextText.font = new Font("Helvetica", 9);
  nextText.textColor = new Color("#ffffff", 0.6);
  nextText.lineLimit = 1;

  nextRow.addSpacer();

  const cdText = nextRow.addText(countdown);
  cdText.font = new Font("Courier-Bold", 9);
  cdText.textColor = new Color("#ffffff", 0.9);
}

widget.addSpacer(2);

// Day progress
const dayPct = Math.round((nowMins / (24 * 60)) * 100);
const progText = widget.addText(`Day ${dayPct}%`);
progText.font = new Font("Courier", 8);
progText.textColor = new Color("#ffffff", 0.4);

// ─── PRESENT ──────────────────────────────────────────
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentAccessoryRectangular();
}
Script.complete();

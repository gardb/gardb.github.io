const LOCALE = navigator.language || "en-US";
const WEEKDAY_FORMATTER = new Intl.DateTimeFormat(LOCALE, { weekday: "long" });
const MONTH_FORMATTER = new Intl.DateTimeFormat(LOCALE, { month: "long" });

const MS_IN_SECOND = 1000;
const MS_IN_DAY = 24 * 60 * 60 * MS_IN_SECOND;

function pad2(number) {
  return String(number).padStart(2, "0");
}

function ensureColonSeparatedStructure(el, partCount) {
  if (!el) return null;

  const children = Array.from(el.children);
  const existingParts = children.filter((child) => child.classList.contains("part"));
  const existingColons = children.filter((child) => child.classList.contains("colon"));
  const expectedColons = Math.max(0, partCount - 1);

  if (existingParts.length === partCount && existingColons.length === expectedColons) {
    return existingParts;
  }

  while (el.firstChild) el.removeChild(el.firstChild);

  const partEls = [];
  for (let i = 0; i < partCount; i += 1) {
    if (i > 0) {
      const colon = document.createElement("span");
      colon.className = "colon";
      colon.textContent = ":";
      el.appendChild(colon);
    }

    const partEl = document.createElement("span");
    partEl.className = "part";
    partEl.textContent = "00";
    el.appendChild(partEl);
    partEls.push(partEl);
  }

  return partEls;
}

function createHudUpdater(el, partCount) {
  const partEls = ensureColonSeparatedStructure(el, partCount) ?? [];
  return (values) => {
    partEls.forEach((partEl, index) => {
      partEl.textContent = values[index] ?? "";
    });
  };
}

function formatDateParts(now) {
  return [String(now.getFullYear()), pad2(now.getMonth() + 1), pad2(now.getDate())];
}

function formatRemainingTimeParts(now) {
  const elapsedMs =
    (now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds()) * MS_IN_SECOND +
    now.getMilliseconds();
  const remainingMs = Math.max(0, MS_IN_DAY - elapsedMs);
  const remainingSeconds = Math.ceil(remainingMs / MS_IN_SECOND);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return [pad2(hours), pad2(minutes), pad2(seconds)];
}

function formatDayMonthParts(now) {
  const weekday = WEEKDAY_FORMATTER.format(now).toLocaleUpperCase(LOCALE);
  const month = MONTH_FORMATTER.format(now).toLocaleUpperCase(LOCALE);
  return [month, weekday];
}

const setTime = createHudUpdater(document.getElementById("hud-time"), 3);
const setDayMonth = createHudUpdater(document.getElementById("hud-daymonth"), 2);
const setDate = createHudUpdater(document.getElementById("hud-date"), 3);

function updateClock() {
  const now = new Date();
  setTime(formatRemainingTimeParts(now));
  setDayMonth(formatDayMonthParts(now));
  setDate(formatDateParts(now));
}

updateClock();

const msUntilNextSecond = MS_IN_SECOND - (Date.now() % MS_IN_SECOND);
setTimeout(() => {
  updateClock();
  setInterval(updateClock, MS_IN_SECOND);
}, msUntilNextSecond);

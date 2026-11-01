const OID_DATE = 1082;
const OID_TIME = 1083;
const OID_TIMETZ = 1266;
const OID_TIMESTAMP = 1114;
const OID_TSTAMPZ = 1184;

const pad = (n) => String(n).padStart(2, '0');

function utcDay(v) {
  return `${v.getUTCFullYear()}-${pad(v.getUTCMonth() + 1)}-${pad(v.getUTCDate())}`;
}

function utcClock(v) {
  return `${pad(v.getUTCHours())}:${pad(v.getUTCMinutes())}:${pad(v.getUTCSeconds())}`;
}

function localStamp(v) {
  return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())} `
    + `${pad(v.getHours())}:${pad(v.getMinutes())}:${pad(v.getSeconds())}`;
}

// Postgres `date` arrives as a Date pinned to UTC midnight, so reading it with local
// getters would show the previous day to a viewer west of Greenwich. `timestamp` is the
// opposite: it arrives shifted into UTC from the server's zone, so local getters recover
// the wall-clock value the student wrote.
export function formatValue(v, typeId) {
  if (v === null || v === undefined) return 'NULL';
  if (v instanceof Date) {
    if (typeId === OID_TIMESTAMP || typeId === OID_TSTAMPZ) return localStamp(v);
    if (typeId === OID_DATE) return utcDay(v);
    const clock = utcClock(v);
    if (typeId === OID_TIME || typeId === OID_TIMETZ) return clock;
    return clock === '00:00:00' ? utcDay(v) : `${utcDay(v)} ${clock}`;
  }
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

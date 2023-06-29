const { DateTime, Interval } = require('luxon');

const db = [
  { name: 'Tainã', number: 555596121988, last: '28-04-2023' },
  { name: 'Cadu', number: 555584241789, last: '02-05-2023' },
  { name: 'Gui', number: 555599140744, last: '01-05-2023' },
  { name: 'Bruce', number: 555584039440, last: '04-05-2023' },
];

// function getFirstAndPutItInLastPosition() {
//   const actualDb = getLastMakedKill();
//   const first = actualDb.shift();
//   actualDb.push(first);
//   return first;
// }
const today = DateTime.fromJSDate(new Date());

function formatDate(date) {
  return DateTime.fromFormat(date, 'dd-MM-yyyy');
}

function getValue(obj, key = 'diff') {
  return obj[key];
}

function getLastValue(obj) {
  return getValue(obj, 'last');
}

function getInterval(start, end) {
  return Interval.fromDateTimes(start, end).toDuration();
}

function getDiffInMilisec(item) {
  const interval = getInterval(formatDate(getLastValue(item)), today);
  return getValue(interval, 'milliseconds');
}

function refreshDiff(item) {
  return { ...item, diff: getDiffInMilisec(item) };
}

function applyDiffOrder(a, b) {
  return getValue(b) - getValue(a);
}

function getLastMakedKill(arr) {
  return arr.map(refreshDiff).sort(applyDiffOrder);
}

console.log(getLastMakedKill(db));

import test from 'node:test';
import assert from 'node:assert/strict';
import { weekdaysForDateRange, initialScheduleWeekdays } from '../lib/schedule-weekdays.mjs';

test('short ranges select only the covered weekdays, including both dates', () => {
  assert.deepEqual(weekdaysForDateRange('2026-11-16', '2026-11-18'), [1, 2, 3]);
  assert.deepEqual(weekdaysForDateRange('2026-11-16', '2026-11-16'), [1]);
  assert.deepEqual(weekdaysForDateRange('2026-11-21', '2026-11-23'), [0, 1, 6]);
  assert.deepEqual(weekdaysForDateRange('2026-12-31', '2027-01-02'), [4, 5, 6]);
  assert.deepEqual(weekdaysForDateRange('2028-02-28', '2028-03-01'), [1, 2, 3]);
});

test('a full week or longer includes all seven days without walking the entire range', () => {
  for (const end of ['2026-11-22', '2026-11-29', '2026-12-16', '2099-12-31'])
    assert.deepEqual(weekdaysForDateRange('2026-11-16', end), [0, 1, 2, 3, 4, 5, 6]);
});

test('incomplete or invalid ranges do not replace manual weekdays', () => {
  for (const [from, end] of [['', ''], ['2026-11-16', ''], ['', '2026-11-18'], ['2026-11-18', '2026-11-16'], ['2026-02-30', '2026-03-03']])
    assert.equal(weekdaysForDateRange(from, end), null);
  assert.deepEqual(initialScheduleWeekdays({ startDate:'2026-11-16',endDate:'2026-11-18',workingDays:[0,1,2,3,4,5,6] }), [1,2,3]);
  assert.deepEqual(initialScheduleWeekdays({ startDate:'2026-11-16',endDate:'2026-11-22',workingDays:[1,2,3,4,5] }), [1,2,3,4,5]);
  assert.deepEqual(initialScheduleWeekdays(), [0,1,2,3,4,5,6]);
});

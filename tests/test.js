import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { createMultipleRanges, createRange } from '../src'

test('should create range', () => {
  const start = new Date()
  const end = new Date()

  end.setDate(end.getDate() + 1)

  const { available } = createRange(start, end)

  assert.equal(new Date(available[0].start).valueOf(), start.valueOf())
  assert.equal(new Date(available[0].end).valueOf(), end.valueOf())
})

test('should create an array of ranges', () => {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const ranges = createMultipleRanges([
    {
      start: today,
      end: tomorrow,
    },
    {
      start: today,
      end: tomorrow,
    },
  ])

  assert.ok(ranges.available.length > 0)
  ranges.available.forEach((rangeItem) => {
    assert.equal(rangeItem.available[0].start, today)
    assert.equal(rangeItem.available[0].end, tomorrow)
  })
})

test('should fail if something other than dates are passed', () => {
  try {
    // FIXME: assert.throws doesn't really work here
    createRange(1, 2)
    assert.unreachable('Should throw')
  }
  catch (err) {
    assert.instance(err, Error)
    assert.match(err.message, /the passed dates should be an instance of Date/)
  }
})

test('should split if start and end are in the range', () => {
  const start = new Date()
  const end = new Date()

  start.setHours(0, 0, 0, 0)
  end.setHours(11, 59, 59, 0)
  end.setDate(end.getDate() + 1)

  const range = createRange(start, end)
  const blockStart = new Date(start)
  const blockEnd = new Date(start)

  blockStart.setHours(10, 0, 0, 0)
  blockEnd.setHours(18, 0, 0, 0)

  range.block(blockStart, blockEnd)

  assert.equal(range.available[0].start.valueOf(), start.valueOf())
  assert.equal(range.available[0].end.valueOf(), blockStart.valueOf())
  assert.equal(range.available[1].start.valueOf(), blockEnd.valueOf())
  assert.equal(range.available[1].end.valueOf(), end.valueOf())
})

test('should not change if start and end are not in range', () => {
  const start = new Date()
  const end = new Date()

  start.setHours(1, 0, 0, 0)
  end.setHours(23, 59, 59, 0)
  end.setDate(end.getDate() + 1)

  const range = createRange(start, end)
  const blockStart = new Date(start)
  const blockEnd = new Date(start)

  blockStart.setHours(0, 0, 0, 0)
  blockEnd.setHours(1, 0, 0, 0)

  const blocked = range.block(blockStart, blockEnd)

  assert.ok(!blocked.changed)
})

test('shouldn\'t change if no matches', () => {
  const start = new Date()
  const end = new Date()

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 0)
  end.setDate(end.getDate() + 1)

  const range = createRange(start, end)
  const blockStart = new Date(start)
  const blockEnd = new Date(start)

  blockStart.setHours(10, 0, 0, 0)
  blockEnd.setHours(18, 0, 0, 0)

  range.block(blockStart, blockEnd)

  const blockStart2 = new Date(start)
  const blockEnd2 = new Date(start)

  blockStart2.setHours(11, 0, 0, 0)
  blockEnd2.setHours(12, 0, 0, 0)

  const blocked = range.block(blockStart2, blockEnd2)

  assert.ok(!blocked.changed)
})

test('should run beforeChange hook', () => {
  const start = new Date()
  const end = new Date()
  let ranHook = false

  start.setHours(0, 0, 0, 0)
  end.setHours(11, 59, 59, 0)
  end.setDate(end.getDate() + 1)

  const range = createRange(start, end)
  const blockStart = new Date(start)
  const blockEnd = new Date(start)

  blockStart.setHours(10, 0, 0, 0)
  blockEnd.setHours(18, 0, 0, 0)

  range.beforeChange(() => {
    ranHook = true
  })

  range.block(blockStart, blockEnd)

  assert.ok(ranHook)
})

test('should run afterChange hook', () => {
  const start = new Date()
  const end = new Date()
  let ranHook = false

  start.setHours(0, 0, 0, 0)
  end.setHours(11, 59, 59, 0)
  end.setDate(end.getDate() + 1)

  const range = createRange(start, end)
  const blockStart = new Date(start)
  const blockEnd = new Date(start)

  blockStart.setHours(10, 0, 0, 0)
  blockEnd.setHours(18, 0, 0, 0)

  range.afterChange(() => {
    ranHook = true
  })

  range.block(blockStart, blockEnd)

  assert.ok(ranHook)
})

test('empty before listener and after listener', () => {
  const start = new Date()
  const end = new Date()

  start.setHours(0, 0, 0, 0)
  end.setHours(11, 59, 59, 0)
  end.setDate(end.getDate() + 1)

  const range = createRange(start, end)
  const blockStart = new Date(start)
  const blockEnd = new Date(start)

  blockStart.setHours(10, 0, 0, 0)
  blockEnd.setHours(18, 0, 0, 0)

  range.beforeChange(null)
  range.afterChange(false)

  range.block(blockStart, blockEnd)
})

test('empty range if the whole range is booked', () => {
  const start = new Date()
  const end = new Date()

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 0)

  const range = createRange(start, end)
  const blockStart = new Date(start)
  const blockEnd = new Date(start)

  blockStart.setHours(0, 0, 0, 0)
  blockEnd.setHours(23, 59, 59, 0)

  range.block(blockStart, blockEnd)

  assert.ok(range.available.length === 0)
})

test('should not block when start is greater than both', () => {
  const start = new Date()
  const end = new Date()

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 0)

  const tomorrowEveStart = new Date()
  tomorrowEveStart.setDate(tomorrowEveStart.getDate() + 1)
  tomorrowEveStart.setHours(15, 0, 0, 0)

  const tomorrowEveEnd = new Date(tomorrowEveStart)
  tomorrowEveEnd.setHours(16, 0, 0, 0)

  const range = createRange(start, end)
  const blockStart = new Date(tomorrowEveStart)
  const blockEnd = new Date(tomorrowEveEnd)

  blockStart.setHours(0, 0, 0, 0)
  blockEnd.setHours(23, 59, 59, 0)

  const blocked = range.block(blockStart, blockEnd)

  assert.not.ok(blocked.changed)
  assert.equal(blocked.effectedRanges.length, 0)
})

test('should not block when start is less but end is greater than the range', () => {
  const start = new Date()
  const end = new Date()

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 0)

  const todayEveStart = new Date()
  todayEveStart.setHours(15, 0, 0, 0)

  const tomorrowEveEnd = new Date(todayEveStart)
  tomorrowEveEnd.setDate(tomorrowEveEnd.getDate() + 1)
  tomorrowEveEnd.setHours(16, 0, 0, 0)

  const range = createRange(start, end)
  const blockStart = new Date(todayEveStart)
  const blockEnd = new Date(tomorrowEveEnd)

  blockStart.setHours(0, 0, 0, 0)
  blockEnd.setHours(23, 59, 59, 0)

  const blocked = range.block(blockStart, blockEnd)

  assert.not.ok(blocked.changed)
  assert.equal(blocked.effectedRanges.length, 0)
})

test('should block on custom data', () => {
  const toBlockStart = new Date('2022-05-23T12:10:18.440Z')
  const toBlockEnd = new Date('2022-05-23T16:10:18.440Z')

  const range = createRange(
    new Date('2022-05-22T18:30:00.000Z'),
    new Date('2022-05-23T18:29:59.999Z'),
  )

  const blocked = range.block(toBlockStart, toBlockEnd)

  assert.ok(blocked.changed)
})

test('should allow blocking the same time again since there\'s multiple ranges', () => {
  const toBlockStart = new Date('2022-05-23T12:10:18.440Z')
  const toBlockEnd = new Date('2022-05-23T16:10:18.440Z')

  const range = createMultipleRanges([
    {
      start: new Date('2022-05-22T18:30:00.000Z'),
      end: new Date('2022-05-23T18:29:59.999Z'),
    },
    {
      start: new Date('2022-05-22T18:30:00.000Z'),
      end: new Date('2022-05-23T18:29:59.999Z'),
    },
  ])

  const blocked = range.block(toBlockStart, toBlockEnd)
  const blocked2 = range.block(toBlockStart, toBlockEnd)

  assert.ok(blocked.changed)
  assert.ok(blocked2.changed)
})

test('should allow blocking at the start of time matches', () => {
  const toBlockStart = new Date('2022-05-31T03:30:00.000Z')
  const toBlockEnd = new Date('2022-05-31T04:30:00.000Z')

  const range = createMultipleRanges([
    {
      start: new Date('2022-05-31T03:30:00.000Z'),
      end: new Date('2022-05-31T12:30:00.000Z'),
    },
  ])

  const blocked = range.block(toBlockStart, toBlockEnd)
  assert.ok(blocked.changed)
})

test.run()

export type Inclusion = '[]' | '()' | '(]' | '[)'

export interface DatePair {
  start: Date
  end: Date
}

function parseInclusivity(input: string) {
  const result = {
    includeStart: false,
    includeEnd: false,
  }

  if (!(input && input.length === 2))
    return result

  const [start, end] = String(input).split('')

  if (start === '(')
    result.includeStart = false
  if (start === '[')
    result.includeStart = true
  if (end === ')')
    result.includeEnd = false
  if (end === ']')
    result.includeEnd = true

  return result
}

/**
 * loi - level of inclusion comparision
 * 0 - equal
 * 1 - greater
 * 2 - greater or equal
 */
function compare(x: unknown, y: unknown, loi: 0 | 1 | 2) {
  switch (loi) {
    case 0:
      return x === y
    case 1:
      return x > y
    case 2:
      return x >= y
  }
}

function inRange(
  range,
  start,
  end,
  { includeStart = false, includeEnd = false } = {},
) {
  const startInRange
    = compare(start.valueOf(), range.start.valueOf(), includeStart ? 2 : 1)
    && start.valueOf() < range.end.valueOf()
  const endInRange
    = end.valueOf() > range.start.valueOf()
    && compare(range.end.valueOf(), end.valueOf(), includeEnd ? 2 : 1)

  return startInRange && endInRange
}

function isEqual(range, start, end) {
  const startEqual = range.start.valueOf() === start.valueOf()
  const endEqual = range.end.valueOf() === end.valueOf()
  return startEqual && endEqual
}

// create a range availability block to browse through
export function createRange(start: Date, end: Date) {
  if (!(start instanceof Date && end instanceof Date)) {
    throw new TypeError(
      '[createRange] the passed dates should be an instance of Date',
    )
  }

  const beforeChangeListeners = []
  const afterChangeListeners = []

  const addChangeListener = (addTo, fn) => {
    addTo.push(fn)
  }

  return {
    available: [
      {
        start: new Date(start),
        end: new Date(end),
      },
    ],
    beforeChange(fn) {
      if (!fn)
        return

      addChangeListener(beforeChangeListeners, fn)
    },
    afterChange(fn) {
      if (!fn)
        return

      addChangeListener(afterChangeListeners, fn)
    },
    block(start: Date, end: Date, inclusivity = '[]') {
      const ctx = this || {}
      const result = { effectedRanges: [], changed: false }

      if (ctx.available.length === 0)
        return result

      const newRanges = []
      const toRemoveIndexes = []

      const { includeStart, includeEnd } = parseInclusivity(inclusivity)

      ctx.available.forEach((range, index) => {
        if (isEqual(range, start, end)) {
          result.effectedRanges.push(range)
          result.changed = true
          toRemoveIndexes.push(index)
          return
        }

        if (!inRange(range, start, end, { includeStart, includeEnd }))
          return

        result.effectedRanges.push(range)
        result.changed = true

        const _startClone = new Date(start)
        const _endClone = new Date(end)

        if (includeStart)
          _startClone.setMinutes(_startClone.getMinutes() - 1)

        if (includeEnd)
          _endClone.setMinutes(_endClone.getMinutes() + 1)

        newRanges.push({
          start: range.start,
          end: _startClone,
        })

        newRanges.push({
          start: _endClone,
          end: range.end,
        })
      })

      if (result.changed) {
        beforeChangeListeners.forEach(x =>
          x({ available: ctx.available.slice() }),
        )

        ctx.available = newRanges.filter(
          (_, i) => !toRemoveIndexes.includes(i),
        )

        afterChangeListeners.forEach(x =>
          x({ available: ctx.available.slice(), ...result }),
        )
      }

      return result
    },
  }
}

// create multiple range blocks at once
export function createMultipleRanges(datePairs: DatePair[] = []) {
  const ranges = datePairs.map((pair) => {
    return createRange(pair.start, pair.end)
  })

  return {
    available: ranges,
    block(start: Date, end: Date, inclusion?: Inclusion) {
      const ctx = this || {}
      for (let i = 0; i < ctx.available.length; i++) {
        const rangeItem = ctx.available[i]
        const blocked = rangeItem.block(start, end, inclusion)
        if (!blocked.changed)
          continue
        return blocked
      }
    },
    nearestAvailability(fromTime: Date) {
      let nextAvailableTime: DatePair | undefined

      ranges.forEach((x) => {
        nextAvailableTime = x.available.find(
          y => y.start.valueOf() > new Date(fromTime).valueOf(),
        )
      })

      return nextAvailableTime
    },
  }
}

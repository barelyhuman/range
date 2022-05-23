<p align="center">
  <img src="images/range.png" height="64">
<p align="center">availability ranges as a tiny little library</p>

[![CI](https://github.com/barelyhuman/range/actions/workflows/ci.yml/badge.svg)](https://github.com/barelyhuman/range/actions/workflows/ci.yml)

**NOTE**: Still adding more and more cases and fixes, feel free to raise issues as you find them

When working with date based bookings and orders, it's mostly preferred to have the
ranges and checks on the DB by using a timeseries database or by simplifying query by setting up good database schemas. Still, sometimes you need the date based checks on the application layer as well and this library was built to help with that.

Also, I wanted to build one.

## Highlights

- Tiny (upto _543B_ minified)
- Zero Deps

## Who is this for?

This is for others to build libraries on top of, you can use this as is but it's written in a way that there are close to no abstractions on the prototypes and can be scaled or masked as needed.

## Usage

```sh
# install
npm i @barelyhuman/range
```

```js
// esm
import {createRange} from '@barelyhuman/range'

// cjs
const {createRange} = require('@barelyhuman/range')
```

## Example

You can find more such examples in the [`tests`](/tests/) files.

The below goes through most of the API

```js
import {createRange} from '@barelyhuman/range'

// decide the start and end of the range
const start = new Date()
const end = new Date()

// start of day
start.setHours(0, 0, 0, 0)

// end of the next day
end.setDate(end.getDate() + 1)
end.setHours(23, 59, 59, 0)

// create a range object out of it
const range = createRange(start, end)

// decide what part of the range to be blocked
const blockStart = new Date(start)
const blockEnd = new Date(start)

blockStart.setHours(10, 0, 0, 0)
blockEnd.setHours(18, 0, 0, 0)

range.beforeChange(({available}) => {
	// triggered before a change is done to the ranges
	// `available` is the ranges before the change is done
})

range.afterChange(({available, effectedRanges, changed}) => {
	// only triggered  **if** a range is changed
	// `changed` is always true here
})

// attempt a block on the range
// should break the original range of today-00:00:00 - tomorrow-23:59:59
// into 2 parts
// [today-00:00:00,today-10:00:00] and [today-18:00:00,tomorrow-23:59:59]
const blocked = range.block(blockStart, blockEnd)

// `blocked.changed` will be true if a range was changed / effected
assert.ok(blocked.changed)
// `blocked.effectedRanges` is an array of the ranges that were effected
assert.equal(blocked.effectedRanges.length, 1)

// you can be verbose and check if the split up ranges are valid.
assert.equal(range.available[0].start.valueOf(), start.valueOf())
assert.equal(range.available[0].end.valueOf(), blockStart.valueOf())

assert.equal(range.available[1].start.valueOf(), blockEnd.valueOf())
assert.equal(range.available[1].end.valueOf(), end.valueOf())
```

## License

[MIT](/license)

<p align="center">
  <img src="images/range.png" height="64">
<p align="center">availability ranges as a tiny little library</p>

[![CI](https://github.com/barelyhuman/range/actions/workflows/ci.yml/badge.svg)](https://github.com/barelyhuman/range/actions/workflows/ci.yml)

When working with date based bookings and orders, it's mostly preferred to have the
ranges and checks on the DB by using a timeseries database or by simplifying query by setting up good database schemas. Still, sometimes you need the date based checks on the application layer as well and this library was built to help with that.

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

You can find more such cases in the [`tests`](/tests/) files

```js
import {createRange} from '@barelyhuman/range'

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
```

## License

[MIT](/license)

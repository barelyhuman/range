function inRange(range, start, end) {
	const startInRange =
		start.valueOf() > range.start.valueOf() &&
		start.valueOf() < range.end.valueOf()
	const endInRange =
		end.valueOf() > range.start.valueOf() && end.valueOf() < range.end.valueOf()
	return startInRange && endInRange
}

function isEqual(range, start, end) {
	const startEqual = range.start.valueOf() === start.valueOf()
	const endEqual = range.end.valueOf() === end.valueOf()
	return startEqual && endEqual
}

const api = {
	beforeChangeListeners: [],
	afterChangeListeners: [],
	_addChangeListener(addTo, fn) {
		addTo.push(fn)
	},
	beforeChange(fn) {
		if (!fn) {
			return
		}
		this._addChangeListener(this.beforeChangeListeners, fn)
	},
	afterChange(fn) {
		if (!fn) {
			return
		}
		this._addChangeListener(this.afterChangeListeners, fn)
	},
	block(start, end) {
		const result = {effectedRanges: [], changed: false}

		if (this.ranges.length === 0) {
			return result
		}

		const newRanges = []
		const toRemoveIndexes = []

		this.ranges.forEach((range, index) => {
			if (isEqual(range, start, end)) {
				result.effectedRanges.push(range)
				result.changed = true
				toRemoveIndexes.push(index)
				return
			}

			if (!inRange(range, start, end)) {
				return
			}

			result.effectedRanges.push(range)
			result.changed = true

			newRanges.push({
				start: range.start,
				end: start,
			})

			newRanges.push({
				start: end,
				end: range.end,
			})
		})

		if (result.changed) {
			this.beforeChangeListeners.forEach(x => x({ranges: this.ranges.slice()}))

			this.ranges = newRanges.filter(
				(_, i) => toRemoveIndexes.indexOf(i) === -1,
			)

			this.afterChangeListeners.forEach(x =>
				x({ranges: this.ranges, ...result}),
			)
		}

		return result
	},
}

export function createRange(start, end) {
	const range = Object.create(api)
	range.ranges = [
		{
			start: new Date(start),
			end: new Date(end),
		},
	]
	return range
}

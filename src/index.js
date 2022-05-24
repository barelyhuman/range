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

		if (this.available.length === 0) {
			return result
		}

		const newRanges = []
		const toRemoveIndexes = []

		this.available.forEach((range, index) => {
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
			this.beforeChangeListeners.forEach(x =>
				x({available: this.available.slice()}),
			)

			this.available = newRanges.filter(
				(_, i) => toRemoveIndexes.indexOf(i) === -1,
			)

			this.afterChangeListeners.forEach(x =>
				x({available: this.available, ...result}),
			)
		}

		return result
	},
}

// create a range availability block to browse through
export function createRange(start, end) {
	if (!(start instanceof Date && end instanceof Date)) {
		throw new Error(
			'[createRange] the passed dates should be an instance of Date',
		)
	}

	const range = Object.create(api)
	range.available = [
		{
			start: new Date(start),
			end: new Date(end),
		},
	]
	return range
}

// create multiple range blocks at once
export function createMultipleRanges(datePairs = []) {
	const ranges = []

	datePairs.forEach(pair => {
		ranges.push(createRange(pair.start, pair.end))
	})

	return {
		available: ranges,
		block(start, end) {
			for (let i = 0; i < this.available.length; i++) {
				let rangeItem = this.available[i]
				const blocked = rangeItem.block(start, end)
				if (!blocked.changed) continue
				return blocked
			}
		},
	}
}

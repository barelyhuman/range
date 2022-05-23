export interface DatePair {
	start: Date
	end: Date
}

export interface Range {
	available: DatePair[]
	beforeChange: (fn: (params: any) => void) => void
	afterChange: (fn: (params: any) => void) => void
	block: (
		start: Date,
		end: Date,
	) => {effectedRanges: DatePair[]; changed: false}
}

export function createRange(start: Date, end: Date): Range

export function createMultipleRanges(datePairs: DatePair[]): Range[]

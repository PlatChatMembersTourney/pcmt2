export const groupByDay = <T extends { date: string }>(
	toGroup: T[],
	timezone: string
): {
	date: string
	items: T[]
}[] => {
	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	})

	const displayFormatter = new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		weekday: 'short',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})

	const groups = new Map<string, T[]>()

	for (const item of toGroup) {
		// 'en-CA' locale formats as YYYY-MM-DD
		const dayKey = formatter.format(new Date(item.date))
		if (!groups.has(dayKey)) {
			groups.set(dayKey, [])
		}
		groups.get(dayKey)!.push(item)
	}

	return [...groups.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([, group]) => ({
			date: displayFormatter.format(new Date(group[0].date)),
			items: group,
		}))
}

/**
 * Formats how long ago a timestamp was, in a shortened style:
 * Does this like VLR.
 *   >= 1 year   -> "3y"
 *   >= 1 month  -> "2mo"
 *   >= 1 week   -> "3w 2d"
 *   >= 1 day    -> "1d 15h"
 *   <  1 day    -> "9h 22m"
 */
export function timeAgo(
	timestamp: string | Date,
	now: Date = new Date()
): string {
	const then = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
	const diffMs = Math.max(0, now.getTime() - then.getTime())

	const MINUTE = 60_000
	const HOUR = 60 * MINUTE
	const DAY = 24 * HOUR
	const WEEK = 7 * DAY
	const MONTH = 30 * DAY // calendar-agnostic approximation
	const YEAR = 365 * DAY

	if (diffMs >= YEAR) {
		return `${Math.floor(diffMs / YEAR)}y`
	}

	if (diffMs >= MONTH) {
		return `${Math.floor(diffMs / MONTH)}mo`
	}

	if (diffMs >= WEEK) {
		const weeks = Math.floor(diffMs / WEEK)
		const days = Math.floor((diffMs % WEEK) / DAY)
		return `${weeks}w ${days}d`
	}

	if (diffMs >= DAY) {
		const days = Math.floor(diffMs / DAY)
		const hours = Math.floor((diffMs % DAY) / HOUR)
		return `${days}d ${hours}h`
	}

	const hours = Math.floor(diffMs / HOUR)
	const minutes = Math.floor((diffMs % HOUR) / MINUTE)
	return `${hours}h ${minutes}m`
}

// timeAgo but for future times
export function timeUntil(
	timestamp: string | Date,
	now: Date = new Date()
): string {
	const future =
		typeof timestamp === 'string' ? new Date(timestamp) : timestamp
	return timeAgo(now, future)
}
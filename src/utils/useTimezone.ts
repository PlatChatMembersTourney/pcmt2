import { useEffect, useState } from 'react';

// The visitor's IANA timezone (e.g. "America/New_York").
// Starts as America/Chicago so the static HTML matches the first render, then switches to the browser's timezone.
export const useTimezone = () => {
	const [timezone, setTimezone] = useState('America/Chicago');

	useEffect(() => {
		setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
	}, []);

	return timezone;
};

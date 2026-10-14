import { useEffect, useState } from 'react';

// The current time, once the page has loaded (undefined before then).
// Relative times ("2d 17h ago") worked out during render would differ between the static HTML, built earlier,
// and the browser (a hydration mismatch) - so they're shown once this is set.
export const useNow = () => {
	const [now, setNow] = useState<Date>();

	useEffect(() => setNow(new Date()), []);

	return now;
};

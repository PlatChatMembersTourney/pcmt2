import { useEffect, useState } from 'react';

// A random value picked in the browser once the page has loaded, so each refresh gets a new one.
// Picking during render would choose differently in the static HTML and in the browser (a hydration mismatch).
// Returns undefined until the pick is made.
export const useRandom = <T>(pick: () => T): T | undefined => {
	const [value, setValue] = useState<T>();

	useEffect(() => setValue(pick()), []);

	return value;
};

// A random item from a list
export const randomItem = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

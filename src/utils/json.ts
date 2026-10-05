// TypeScript widens values in imported JSON ("bracket" becomes string, 2 becomes number), so JSON can't be
// checked directly against types that use literal unions. This checks it against a widened copy of the type
// instead (still catching missing fields and wrong value types), then hands it back as the real type.
type Widen<T> = T extends string
	? string
	: T extends number
		? number
		: T extends object
			? { [K in keyof T]: Widen<T[K]> }
			: T;

export const fromJson = <T>(data: Widen<T>) => data as T;

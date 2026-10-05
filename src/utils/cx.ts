// Joins class names, skipping falsy ones - e.g. cx('px-2', isActive && 'font-bold')
export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

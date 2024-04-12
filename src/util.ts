export function notNull<T>(a: T | null | undefined): a is T {
    return a != null;
}
export function callNTimes<T>(n: number, fn: (i: number) => T): T[] {
    return new Array(n).fill(null).map((_, i) => fn(i));
}
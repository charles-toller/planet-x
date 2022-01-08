export function notNull<T>(a: T | null | undefined): a is T {
    return a != null;
}
export function cacheOutputIfShallowEquals<Args extends unknown[], Output extends unknown[], This>(fn: (this: This, ...args: Args) => Output): (this: This, ...args: Args) => Output {
    let lastOutput: Output | null = null;
    return function(...args: Args): Output {
        const newOutput: Output = fn.apply(this, args);
        if (lastOutput == null || newOutput.some((item, i) => lastOutput![i] !== item)) {
            lastOutput = newOutput;
        }
        return lastOutput;
    }
}
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

export class CombineMatchers<Input = never, Output extends Input = never, ExtraData = {}> {
    private matchers: Array<(item: unknown) => boolean> = [];
    private extractors: Array<{matcher: (item: unknown) => boolean; extractor: (item: unknown) => ExtraData}> = [];
    addExtraData<ValueType, Name extends string>(name: Name, value: ValueType): CombineMatchers<Input, Output, ExtraData & {[key in Name]: ValueType}> {
        return this as any;
    }
    addMatcher<NewInput, NewOutput extends NewInput>(matcher: (item: NewInput) => item is NewOutput): CombineMatchers<Input | NewInput, Output | NewOutput>;
    addMatcher<NewInput, NewOutput extends NewInput>(matcher: (item: NewInput) => item is NewOutput, extractor: (item: NewOutput) => ExtraData): CombineMatchers<Input | NewInput, Output | NewOutput, ExtraData>;
    addMatcher<NewInput, NewOutput extends NewInput>(matcher: (item: NewInput) => item is NewOutput, extractor?: (item: NewOutput) => ExtraData): CombineMatchers<Input | NewInput, Output | NewOutput, ExtraData | {}> {
        this.matchers.push(matcher as any);
        if (extractor) {
            this.extractors.push(extractor as any);
        }
        return this as any;
    }
    get match(): (input: Input) => input is Output {
        return this._match.bind(this);
    }
    private _match(input: Input): input is Output {
        return this.matchers.some((matcher) => matcher(input));
    }
    extract(input: Input): ExtraData {
        for (const extractor of this.extractors) {
            if (extractor.matcher(input)) {
                return extractor.extractor(input);
            }
        }
        throw new Error("Failed to match!");
    }
}
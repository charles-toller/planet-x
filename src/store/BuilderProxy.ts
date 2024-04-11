import {Action, ActionReducerMapBuilder, CaseReducer} from "@reduxjs/toolkit";
import {Omit, TypeGuard} from "@reduxjs/toolkit/dist/tsHelpers";

export class BuilderProxy<T> implements ActionReducerMapBuilder<T> {
    private realBuilder: ActionReducerMapBuilder<T>;
    constructor(builder: ActionReducerMapBuilder<T>) {
        this.realBuilder = builder;
    }
    private _addCases: Array<{type: any; reducer: any}> = [];
    addCase<Type extends string, A extends Action<Type>>(type: Type, reducer: CaseReducer<T, A>): ActionReducerMapBuilder<T> {
        this._addCases.push({type, reducer});
        return this;
    }
    private _addMatchers: Array<{matcher: any; reducer: any}> = [];
    addMatcher<A>(matcher: TypeGuard<A> | ((action: any) => boolean), reducer: CaseReducer<T, A extends Action ? A : (A & Action)>): Omit<ActionReducerMapBuilder<T>, "addCase"> {
        this._addMatchers.push({matcher, reducer});
        return this;
    }
    private _defaultCases: Array<{reducer: any}> = [];
    addDefaultCase(reducer: CaseReducer<T, Action>): {} {
        this._defaultCases.push({reducer});
        return {};
    }
    build() {
        this._addCases.forEach(({type, reducer}) => {
            this.realBuilder.addCase(type, reducer);
        });
        this._addMatchers.forEach(({matcher, reducer}) => {
            this.realBuilder.addMatcher(matcher, reducer);
        });
        this._defaultCases.forEach(({reducer}) => {
            this.realBuilder.addDefaultCase(reducer);
        });
        return this.realBuilder;
    }
}
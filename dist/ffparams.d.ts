export interface Filter {
    name: any;
}
export interface FilterChain {
    input?: Iterable<number | string> | number | string;
    output?: Iterable<number | string> | number | string;
    filters?: Iterable<Filter>;
}
type Value = string | number | boolean;
interface Stream {
    path?: string;
    args: (string | [string, Value] | string[])[];
    tag?: string;
    index?: number;
}
export interface Input extends Stream {
    loop?: number;
}
export interface Output extends Stream {
    format?: string;
}
interface FFCommand {
    bin?: string;
    args?: Iterable<string> | {
        [key: string]: Value;
    };
    input?: Input | Iterable<Input> | string;
    graph?: Iterable<FilterChain>;
    output?: Output | Iterable<Output> | string;
    filterComplexScript?: (g: string) => string;
}
export declare function ffGraph(fg: Iterable<FilterChain>): string;
export declare function flattenArgs(args: Iterable<string | [string, Value] | string[]> | {
    [key: string]: Value;
}): Generator<any, void, unknown>;
export declare function ffParams(opt: FFCommand): Array<string>;
export {};

import * as JsonPointer from "json-pointer";

export type JSONPointer = `/${'' | string}`;

type Never<PATH extends string> = {never: PATH};

type _PointerFor<T> =
    T extends symbol | boolean | number | string
        ? ''
        : T extends Array<infer VAL>
            ? `/${number}` | `/${'<index>' | number}${_PointerFor<VAL>}`
            : T extends Record<infer KEY, unknown>
                ? KEY extends string | number
                    ? `/${KEY}` | `/${KEY}${_PointerFor<T[KEY]>}`
                    : `` // symbol
                : never;

export type PointerFor<T> = '/' | _PointerFor<T>;

export type PointerValue<T, POINTER extends PointerFor<T>> =
    POINTER extends `/${infer KEY}/${infer Rest}`
        ? T extends Array<infer VAL>
            ? `/${Rest}` extends _PointerFor<VAL>
                ? PointerValue<VAL, `/${Rest}`>
                : Never<`/${Rest}`>
            : KEY extends keyof T
                ? `/${Rest}` extends _PointerFor<T[KEY]>
                    ? PointerValue<T[KEY], `/${Rest}`>
                    : Never<`/${Rest}`>
                : never
        : POINTER extends `/${infer KEY}`
            ? KEY extends ``
                ? T
                : T extends Array<infer VAL>
                    ? VAL
                    : KEY extends keyof T
                        ? T[KEY]
                        : Never<KEY>
            : Never<POINTER>;

export function addToPointer(cur: string, ...tokens: string[]) {
    return JsonPointer.compile([
        ...JsonPointer.parse(cur.length == 1 ? '' : cur),
        ...tokens
    ]) as string as JSONPointer;
}

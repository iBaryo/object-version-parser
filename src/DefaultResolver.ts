import {addToPointer, PointerFor} from "./JSONPointer";

export type DefaultResolver<TARGET> =
    TARGET
    | ((fieldPointer: PointerFor<TARGET>) => TARGET | Promise<TARGET>)
    | (TARGET extends Array<infer VAL>
    ? Array<() => DefaultResolver<VAL>>
    : TARGET extends object
        ? { [K in keyof TARGET]?: DefaultResolver<TARGET[K]> }
        : null);

export async function resolveDefault(
    defaultResolver: DefaultResolver<unknown>,
    curPointer: string,
    globalDefaultResolver?: (curPointer) => any) {

    defaultResolver = defaultResolver ?? globalDefaultResolver;

    if (typeof defaultResolver == 'function') {
        return defaultResolver(curPointer);
    } else if (defaultResolver instanceof Array) {
        return Promise.all(
            defaultResolver.map((resolver, i) =>
                resolveDefault(resolver, addToPointer(curPointer, i.toString()))))
    } else if (typeof defaultResolver == 'object') {
        const res = {};
        for (const [k, resolver] of Object.entries(defaultResolver)) {
            res[k] = await resolveDefault(resolver, addToPointer(curPointer, k));
        }
        return res;
    } else {
        return defaultResolver;
    }
}

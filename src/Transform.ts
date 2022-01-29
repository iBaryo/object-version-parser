import {isFieldMap, PointerMap, srcPointer} from "./PointerMap";
import {addToPointer, JSONPointer, PointerFor} from "./JSONPointer";
import {resolveDefault} from "./DefaultResolver";
import * as JsonPointer from "json-pointer";

export async function generateFromSource<TARGET, SRC>(
    src: SRC,
    pointers: PointerMap<TARGET, SRC>,
    globalDefaultResolver?: (curPointer) => any,
    curPointer: JSONPointer = '/'): Promise<TARGET> {

    if (isFieldMap(pointers)) {
        let srcPtr: PointerFor<SRC>;
        let defVal;

        if (typeof pointers == 'string') {
            srcPtr = pointers;
        } else {
            srcPtr = pointers[srcPointer];
            defVal = pointers.default;
        }
        if (JsonPointer.has(src, srcPtr)) {
            return JsonPointer.get(src, srcPtr);
        } else {
            return resolveDefault(defVal, curPointer, globalDefaultResolver);
        }
    } else if (pointers instanceof Array) {
        return Promise.all(pointers.map(
            (pointer, i) =>
                generateFromSource(
                    src,
                    pointer,
                    globalDefaultResolver,
                    addToPointer(curPointer, i.toString())
                ))) as unknown as TARGET;

    } else if (typeof pointers == 'object') {
        const res = {} as TARGET;
        for (const [k, pointer] of Object.entries(pointers)) {
            res[k] =
                await generateFromSource(
                    src,
                    pointer as PointerMap<TARGET[keyof TARGET], SRC>,
                    globalDefaultResolver,
                    addToPointer(curPointer, k));
        }
        return res;
    } else { // number, boolean, func
        /// todo: ignore or throw?
    }
}

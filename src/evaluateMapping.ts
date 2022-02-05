import {isFieldMap, PointerMap, mappingConfig, FieldMap} from "./PointerMap";
import {addToPointer, JSONPointer, PointerFor} from "./JSONPointer";
import {resolveDefault} from "./DefaultResolver";
import * as JsonPointer from "json-pointer";

export async function evaluateMapping<TARGET, SRC>(
    src: SRC,
    pointers: PointerMap<TARGET, Required<SRC>>,
    globalDefaultResolver?: (curPointer) => any,
    curPointer: JSONPointer = '/'): Promise<TARGET> {

    if (isFieldMap(pointers)) {
        let srcPtr: PointerFor<SRC>;
        let defVal;

        if (typeof pointers == 'string') {
            srcPtr = pointers;
        } else {
            srcPtr = pointers[mappingConfig].srcPointer as any; // TODO: fix
            defVal = pointers[mappingConfig].default;
        }
        if (JsonPointer.has(src, srcPtr)) {
            return JsonPointer.get(src, srcPtr);
        } else {
            return resolveDefault(defVal, curPointer, globalDefaultResolver);
        }
    } else if (pointers instanceof Array) {
        return (await Promise.all(pointers.map(
            (pointer, i) =>
                evaluateMapping(
                    src,
                    pointer,
                    globalDefaultResolver,
                    addToPointer(curPointer, i.toString())
                )))) as unknown as TARGET;

    } else if (typeof pointers == 'object') {
        return Object.fromEntries(
            await Promise.all(
                // TODO: fix any
                Object.entries<any>(pointers).map(async ([k, pointer]) => [
                    k,
                    await evaluateMapping(
                        src,
                        pointer,
                        globalDefaultResolver,
                        addToPointer(curPointer, k))
                ])
            )
        );
    } else { // number, boolean, func
        /// todo: ignore or throw?
    }
}

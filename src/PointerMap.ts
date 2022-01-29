import {PointerFor} from "./JSONPointer";
import {DefaultResolver} from "./DefaultResolver";

export const srcPointer = Symbol('src pointer');

export type FieldMap<TARGET, SRC> = PointerFor<SRC>
    | {
    [srcPointer]: PointerFor<SRC>;
    default?: DefaultResolver<TARGET>;
};

export function isFieldMap<TARGET>(p: any): p is FieldMap<TARGET, unknown> {
    return typeof p == 'string' || srcPointer in p;
}

export type PointerMap<TARGET, SRC> = FieldMap<TARGET, SRC>
    | (TARGET extends Array<infer R>
    ? Array<PointerMap<R, SRC>>
    : TARGET extends object
        ? { [K in keyof TARGET]: PointerMap<TARGET[K], SRC> }
        : FieldMap<TARGET, SRC>);

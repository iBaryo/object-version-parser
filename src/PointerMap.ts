import {PointerFor, PointerValue} from "./JSONPointer";
import {DefaultResolver} from "./DefaultResolver";
import {Pipe, Reducer} from "./TransformerDefinition";

export const mappingConfig = Symbol('mapping config');

export type FieldMap<TARGET, SRC, P extends PointerFor<SRC> = PointerFor<SRC>> =
    P | { [mappingConfig]: SourceConfig<TARGET, SRC, P> };

export function isFieldMap<TARGET>(p: any): p is FieldMap<TARGET, unknown> {
    return typeof p == 'string' || mappingConfig in p;
}

export type PointerMap<TARGET, SRC> = FieldMap<TARGET, SRC>
    | (TARGET extends Array<infer R>
    ? Array<PointerMap<R, SRC>>
    : TARGET extends object
        ? { [K in keyof TARGET]: PointerMap<TARGET[K], SRC> }
        : FieldMap<TARGET, SRC>);


type SourceConfigBase<TARGET, SRC> = {
    default?: DefaultResolver<TARGET>;
    pipe?: [...pipes: Pipe<any, any>[], finalTrans: Pipe<unknown, TARGET>];
} & (
    TARGET extends Array<infer ENTRY>
        ? { entryMap?: PointerMap<ENTRY, SRC> }
        : object
    );

type SingleSourceConfig<TARGET, SRC, P extends PointerFor<SRC> = PointerFor<SRC>, PVAL extends PointerValue<SRC, P> = PointerValue<SRC, P>> =
    SourceConfigBase<TARGET, SRC> & { srcPointer: P; }
    & (PVAL extends Array<infer S_ENTRY>
    ? TARGET extends Array<infer T_ENTRY>
        ? { entryMap?: PointerMap<T_ENTRY, S_ENTRY> }   // array to array
        : TARGET extends object
            ? {                     // array to object
                reducer: S_ENTRY extends object ? {         // object-array [kvps] to object
                        keyPointer: PointerFor<S_ENTRY>,
                        valuePointer: PointerFor<S_ENTRY>
                    }
                    : Reducer<S_ENTRY[], TARGET>            // primitive-array to object // TODO: what about array-arrays?
            }
            : {} // array to primitive
    : {} // object|primitive to any
    );

// type MultiSourceConfig<TARGET, SRC, P extends PointerFor<SRC> = PointerFor<SRC>, PVAL extends PointerValue<SRC, P> = PointerValue<SRC, P>> =
//     SourceConfigBase<TARGET, SRC> & {
//     srcPointer: P[];
//     reducer: Reducer<PVAL[], TARGET>;
// }

export type SourceConfig<TARGET, SRC, P extends PointerFor<SRC> = PointerFor<SRC>> =
    SingleSourceConfig<TARGET, SRC, P>
    // | MultiSourceConfig<TARGET, SRC, P>
    ;

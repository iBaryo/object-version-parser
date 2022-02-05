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

type SingleSourceConfig<TARGET, SRC, P extends PointerFor<SRC> = PointerFor<SRC>> =
    SourceConfigBase<TARGET, SRC> & { srcPointer: P; }

type MultiSourceConfig<TARGET, SRC, P extends PointerFor<SRC> = PointerFor<SRC>> =
    SourceConfigBase<TARGET, SRC> & {
    srcPointer: P[];
    reducer: Reducer<PointerValue<SRC, P>[], TARGET>;
}

export type SourceConfig<TARGET, SRC, P extends PointerFor<SRC> = PointerFor<SRC>> =
    SingleSourceConfig<TARGET, SRC, P> | MultiSourceConfig<TARGET, SRC, P>;

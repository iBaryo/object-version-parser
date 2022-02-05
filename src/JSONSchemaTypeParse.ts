import {JSONSchema7, JSONSchema7TypeName} from "json-schema";

export type NReadonly<T> = {
    -readonly [P in keyof T]: NReadonly<T[P]>;
};

export type ReadOnlyDeep<T> = {
    readonly [P in keyof T]: ReadOnlyDeep<T[P]>;
};

export type Parse<SCHEMA extends JSONSchema7> =
    SCHEMA extends Array<infer SUBSCHEMA>
        ? Array<Parse<SUBSCHEMA>>
        : SCHEMA extends boolean
            ? boolean
            : SCHEMA['allOf'] extends Array<infer SUBSCHEMA> // TODO: test schema combiners
                ? & Parse<SUBSCHEMA>
                : SCHEMA['anyOf'] extends Array<infer SUBSCHEMA>
                    ? & Parse<SUBSCHEMA>
                    : SCHEMA['oneOf'] extends Array<infer SUBSCHEMA>
                        ? | Parse<SUBSCHEMA>
                        : SCHEMA['type'] extends Array<infer TYPES>
                            ? TYPES extends JSONSchema7TypeName
                                ? Parse<{ type: TYPES }>
                                : never
                            : SCHEMA['type'] extends 'null'
                                ? null
                                : SCHEMA['type'] extends 'string'
                                    ? SCHEMA['enum'] extends Array<infer ENUM>
                                        ? ENUM
                                        : string
                                    : SCHEMA['type'] extends 'number'
                                        ? SCHEMA['enum'] extends Array<infer ENUM>
                                            ? ENUM
                                            : number
                                        : SCHEMA['type'] extends 'integer'
                                            ? SCHEMA['enum'] extends Array<infer ENUM>
                                                ? ENUM
                                                : number
                                            : SCHEMA['type'] extends 'boolean'
                                                ? boolean
                                                : SCHEMA['type'] extends 'object'
                                                    ? ParseObj<SCHEMA>
                                                    : SCHEMA['type'] extends 'array'
                                                        ? SCHEMA['items'] extends Array<infer SUBSCHEMA>
                                                            ? Array<Parse<SUBSCHEMA>>
                                                            // @ts-ignore JSONSchema7Definition contains bool
                                                            : Array<Parse<SCHEMA['items']>>
                                                        : { never: SCHEMA };


export type ParseObj<SCHEMA extends Pick<JSONSchema7, 'properties' | 'additionalProperties' | 'required'>> =
    SCHEMA['additionalProperties'] extends true
        ? Record<string, any>
        : SCHEMA['required'] extends Array<infer PROPS>
            ? PROPS extends keyof ParseObjProps<SCHEMA>
                ? Required<Pick<ParseObjProps<SCHEMA>, PROPS>> & Pick<ParseObjProps<SCHEMA>, Exclude<keyof ParseObjProps<SCHEMA>, PROPS>>
                : ParseObjProps<SCHEMA>
            : ParseObjProps<SCHEMA>;

type ParseObjProps<SCHEMA extends Pick<JSONSchema7, 'properties' | 'additionalProperties' | 'required'>> =
// @ts-ignore JSONSchema7Definition contains bool
    { [K in keyof SCHEMA['properties']]?: Parse<SCHEMA['properties'][K]> };



import {JSONSchema7} from "json-schema";
import {NReadonly, Parse, ParseObj, ReadOnlyDeep} from "./JSONSchemaTypeParse";

interface TransformerDefinition<INPUT extends JSONSchema7 = JSONSchema7,
    OUTPUT extends JSONSchema7 = JSONSchema7> {
    inputSchema: INPUT;
    outputSchema: OUTPUT;
    configSchema?: Record<string, JSONSchema7>;
}

interface MultiInputTransformerDefinition<INPUT extends JSONSchemaArray = JSONSchemaArray,
    OUTPUT extends JSONSchema7 = JSONSchema7> extends TransformerDefinition<INPUT, OUTPUT> {
}

type JSONSchemaArray = {
    type: 'array';
} & Pick<JSONSchema7, 'items' | 'additionalItems' | 'maxItems' | 'minItems'>;

export const SupportedMultiInputTransformer = {
    concat: {
        inputSchema: {
            type: 'array',
            maxItems: 10,
            items: {
                type: ['string', 'number', 'null']
            }
        },
        outputSchema: {
            type: 'string'
        },
        configSchema: undefined
    },
    count: {
        inputSchema: {
            type: 'array',
        },
        outputSchema: {
            type: 'number'
        },
        configSchema: undefined
    },
    arithmetic: {
        inputSchema: {
            type: 'array',
            maxItems: 10,
            items: {
                type: 'number'
            }
        },
        outputSchema: {
            type: 'number'
        },
        configSchema: {
            type: 'object',
            required: ['operator'],
            properties: {
                operator: {
                    type: 'string',
                    enum: ['sum', 'multiply']
                },
            }
        }
    },
} as const;

export const SupportedSingleInputTransformers = {
    hash: {
        inputSchema: {
            type: 'string',
        },
        outputSchema: {
            type: 'string'
        },
        configSchema: undefined
    }
} as const;

type SupportedReducers = NReadonly<typeof SupportedMultiInputTransformer>;
type SupportedPipes = NReadonly<typeof SupportedSingleInputTransformers>;

type AllTrans = SupportedReducers & SupportedPipes;

export type Transformation<TYPE extends keyof AllTrans = keyof AllTrans> =
    TYPE extends keyof AllTrans
        ? {
        type: TYPE
        logic?: (input: Parse<AllTrans[TYPE]['inputSchema']>) => Parse<AllTrans[TYPE]['outputSchema']>;
    } & (
        AllTrans[TYPE]['configSchema'] extends JSONSchema7
            ? AllTrans[TYPE]['configSchema']['type'] extends 'object'
                ? { config: ParseObj<AllTrans[TYPE]['configSchema']> }
                : object
            : object
        )
        : never;

export type Reducer<SRCs extends Array<unknown>, TARGET> = Transformation<keyof SupportedReducers> | ((...inputs: SRCs) => TARGET);
export type Pipe<SRC, TARGET> = Transformation<keyof SupportedPipes> | ((input: SRC) => TARGET);

const test: Transformation[] = [
    {
        type: 'count',
        logic: input => input.length
    },
    {
        type: 'hash',
        logic: input => input.toLowerCase()
    },
    {
        type: 'concat',
        logic: input => input.join('.')
    },
    {
        type: 'arithmetic',
        logic: input => input.reduce((res, cur) => res+cur, 0),
        config: {
            operator: 'sum'
        }
    }
]


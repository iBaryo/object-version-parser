import {evaluateMapping} from "../src/evaluateMapping";
import {mappingConfig} from "../src/PointerMap";

interface MyObject {
    '1': string;
    '2': number;
    a: string;
    b: {
        '3': { x: string };
        c: symbol;
        d: {
            e: boolean;
            f: {
                g: number;
                h: ['asd'];
                i: number[];
                j: string[][];
                k: Array<{
                    x: string;
                    y: number;
                    z: boolean;
                    t: string[];
                    v: Array<{
                        p: string;
                    }>
                }>
            }
        }
    }
}

// evaluateMapping<Partial<MyObject>, Partial<MyObject>>({
//     a: 'string'
// },
//     {
//         b: {
//             d: {
//                 f: {
//                     g: '/b/d/f',
//                     h: {
//                         [mappingConfig]: {
//                             entryMap: '/a'
//                         }
//                     }
//                 }
//             }
//         }
//     })


describe('different types', function () {
    it('should map number', function () {

    });
    it('should map string', function () {

    });
    it('should map bool', function () {

    });
    it('should map symbol', function () {

    });
    it('should map primitive-array', function () {

    });
    it('should map object-array', function () {

    });
    it('should map undefined', function () {

    });
    it('should map null', function () {

    });
    it('should fallback to default if path does not exist', function () {
        
    });
});

describe('defaults', function () {
    it('should fallback to undefined if default does not exist', function () {

    });
    it('should resolve to default value', function () {
        
    });
    it('should resolve to async value', function () {

    });
    it('should resolve to target array of resolvers', function () {

    });
    it('should resolve to the target object with resolvers', function () {

    });
});

describe('object nesting', function () {
    it('should map at root', function () {

    });
    it('should map at object nesting', function () {

    });
    it('should map at deep object nesting', function () {

    });
});

describe('array entry mapping', function () {
    it('should transform primitive entries', function () {

    });
    it('should map entries to a different interface', function () {

    });
    it('should map entries to a different interface with several nesting level', function () {

    });
});

describe('multi source', function () {

});

describe('normalized objects', function () {
    describe('KVPs', function () {
        const example = [
            {key: 'firstName', value: 'Sassi'},
            {key: 'lastName', value: 'Keshet'},
            {key: 'age', value: 24}
        ];

        describe('explode to', function () {

        });
        describe('reduce from', function () {

        });
    });

    describe('external columns', function () {
        const example = {
            columns: ['firstName', 'lastName', 'age'],
            customers: [
                ['Chris', 'Pratt', 32],
                ['Gal', 'Gadot', 67],
                ['Sassi', 'Keshet', 24]
            ]
        };

        describe('explode to', function () {

        });
        describe('reduce from', function () {

        });
    });
});

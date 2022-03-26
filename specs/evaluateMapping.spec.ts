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
    interface Obj<T> {
        prop: T;
    }

    it('should map number', async function () {
        expect(
            await evaluateMapping<Obj<number>, Obj<number>>({
                prop: 42
            }, {
                prop: '/prop'
            })
        ).toEqual({prop: 42});
    });
    it('should map string', async function () {
        expect(
            await evaluateMapping<Obj<string>, Obj<string>>({
                prop: '42'
            }, {
                prop: '/prop'
            })
        ).toEqual({prop: '42'});
    });
    it('should map bool', async function () {
        expect(
            await evaluateMapping<Obj<boolean>, Obj<boolean>>({
                prop: true
            }, {
                prop: '/prop'
            })
        ).toEqual({prop: true});
    });
    it('should map symbol', async function () {
        const s = Symbol();
        expect(
            await evaluateMapping<Obj<symbol>, Obj<symbol>>({
                prop: s
            }, {
                prop: '/prop'
            })
        ).toEqual({prop: s});
    });
    it('should map primitive-array', async function () {
        expect(
            await evaluateMapping<Obj<[42, 'asd', true]>, Obj<[42, 'asd', true]>>({
                prop: [42, 'asd', true]
            }, {
                prop: '/prop'
            })
        ).toEqual({prop: [42, 'asd', true]});
    });
    it('should map object-array', async function () {
        expect(
            await evaluateMapping<Obj<object[]>, Obj<object[]>>({
                prop: [{a: 1}, {b: 2}]
            }, {
                prop: '/prop'
            })
        ).toEqual({prop: [{a: 1}, {b: 2}]});
    });
    it('should map undefined', async function () {
        expect(
            await evaluateMapping<Obj<undefined>, Obj<undefined>>({
                prop: undefined
            }, {
                prop: '/prop'
            })
        ).toEqual({prop: undefined});
    });
    it('should map null', async function () {
        expect(
            await evaluateMapping<Obj<null>, Obj<null>>({
                prop: null
            }, {
                prop: '/prop'
            })
        ).toEqual({prop: null});
    });
});

describe('defaults', function () {
    interface Target {
        target: string;
    }

    interface Source {
        doesNotExist?: string;
    }

    it('should fallback to undefined if default does not exist', async function () {
        expect(
            await evaluateMapping<Target, Source>(
                {},
                {target: '/doesNotExist'}).then(result => result.target)
        ).toBeUndefined();
    });

    it('should resolve to default value', async function () {
        expect(
            await evaluateMapping<Target, Source>(
                {},
                {
                    target: {
                        [mappingConfig]: {
                            srcPointer: '/doesNotExist',
                            default: '42'
                        }
                    }
                }).then(result => result.target)
        ).toBe('42');

    });
    it('should async resolve to value', async function () {
        expect(
            await evaluateMapping<Target, Source>(
                {},
                {
                    target: {
                        [mappingConfig]: {
                            srcPointer: '/doesNotExist',
                            default: async () => '42'
                        }
                    }
                }).then(result => result.target)
        ).toBe('42');
    });
    xit('should resolve to target array of resolvers', function () {

    });
    xit('should resolve to the target object with resolvers', function () {

    });
});

describe('object nesting', function () {
    it('should map primitive at root', async function () {
        expect(
            await evaluateMapping(42, '/')
        ).toBe(42);

        expect(
            await evaluateMapping({a: 42}, '/a')
        ).toBe(42);

        expect(
            await evaluateMapping<{ a: number }, number>(42, {a: '/'})
        ).toEqual({a: 42});
    });

    it('should map array at root', async function () {
        expect(
            await evaluateMapping([42], '/')
        ).withContext('get root array to root target')
            .toEqual([42]);

        expect(
            await evaluateMapping([[42]], '/0')
        ).withContext('unbox from root array')
            .toEqual([42]);

        expect(
            await evaluateMapping<{ a: number[] }, number[]>([42], {a: '/'})
        ).withContext('get root array to prop')
            .toEqual({a: [42]});

        expect(
            await evaluateMapping<{ a: number[] }, number[][]>([[42]], {a: '/0'})
        ).withContext('unbox from root array to prop')
            .toEqual({a: [42]});
    });

    it('should map at object root', async function () {
        const obj = {a: 42};
        expect(
            await evaluateMapping(obj, '/')
        ).withContext('get root to root target')
            .toEqual(obj);

        expect(
            await evaluateMapping({obj}, '/obj')
        ).withContext('unbox from root')
            .toEqual(obj);

        expect(
            await evaluateMapping<{ a: typeof obj }, typeof obj>(obj, {a: '/'})
        ).withContext('get root to prop')
            .toEqual({a: obj});
    });

    it('should map at object nesting', async function () {
        const obj = {x: 42};

        interface Deep<T> {
            a: { b: { c: { obj: T } } }
        }

        expect(
            await evaluateMapping<Deep<typeof obj>, Deep<typeof obj>>({
                a: {
                    b: {
                        c: {
                            obj
                        }
                    }
                }
            }, {
                a: {
                    b: {
                        c: {
                            obj: '/a/b/c/obj'
                        }
                    }
                }
            })
        ).toEqual({a: {b: {c: {obj}}}});
    });

    it('should map at deep object/array nesting', async function () {
        const obj = {x: 42};

        interface Deep<T> {
            a: Array<{ b: Array<{ c: Array<{ obj: T }> }> }>
        }

        expect(
            await evaluateMapping<Deep<typeof obj>, Deep<typeof obj>>({
                a: [{
                    b: [{
                        c: [{
                            obj
                        }]
                    }]
                }]
            }, {
                a: [{
                    b: [{
                        c: [{
                            obj: '/a/0/b/0/c/0/obj'
                        }]
                    }]
                }]
            })
        ).toEqual({
            a: [{
                b: [{
                    c: [{
                        obj
                    }]
                }]
            }]
        });
    });
});

xdescribe('array entry mapping', function () {
    it('should transform primitive entries', function () {

    });

    it('should map entries to a different interface', function () {

    });
    it('should map entries to a different interface with several nesting level', function () {

    });
});

// describe('multi source', function () {
//
// });
//
describe('normalized objects', function () {
    interface Normalized {
        firstName: string;
        lastName: string;
        age: number;
    }

    xdescribe('KVPs', function () {
        type KVP<T, K extends keyof T = keyof T> = { key: K; value: T[K]; }

        type Source = Array<KVP<Normalized>>;

        const example: Source = [
            {key: 'firstName', value: 'Sassi'},
            {key: 'lastName', value: 'Keshet'},
            {key: 'age', value: 24}
        ];

        it('should explode to', function () {

        });
        it('should reduce from', function () {

        });
    });

    xdescribe('external columns', function () {
        const example = {
            columns: ['firstName', 'lastName', 'age'],
            customers: [
                ['Chris', 'Pratt', 32],
                ['Gal', 'Gadot', 67],
                ['Sassi', 'Keshet', 24]
            ]
        };

        xdescribe('explode to', function () {

        });
        xdescribe('reduce from', function () {

        });
    });
});

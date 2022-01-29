import {generateFromSource} from "./src/Transform";
import {Version, VersionResolver} from "./src/Version";
import {DefaultResolver} from "./src/DefaultResolver";
import {PointerMap} from "./src/PointerMap";

type VersionMapper<TARGET, V> = {
    map: <SRC = any>(v: V, map: PointerMap<TARGET, SRC>) => VersionMapper<TARGET, V>;
};

export class VersionParser<TARGET, V extends Version = Version> {
    private readonly versionMap = {} as Record<V, PointerMap<TARGET, unknown>>;

    constructor(private readonly options: {
        versionMapper: ((mapper: VersionMapper<TARGET, V>) => void),
        versionResolver?: VersionResolver<V>,
        defaultValueResolver?: DefaultResolver<any>
    }) {
        const mapper = {
            map: (v, pointerMap) => {
                this.versionMap[v] = pointerMap;
                return mapper;
            }
        };
        this.options.versionMapper(mapper);
    }

    public async transform<SRC>(o: SRC, versionResolver?: VersionResolver<V, SRC>): Promise<TARGET> {
        const vResolver: VersionResolver<V> =
            versionResolver ?? this.options.versionResolver;

        const version =
            typeof vResolver == 'function' ? vResolver(o) : o[vResolver];

        if (!version)
            throw `couldn't resolve version in: ${JSON.stringify(o)}`;

        const pointerMap = this.versionMap[version];

        if (!pointerMap)
            throw `version ${version} is not supported`;

        return generateFromSource(o, pointerMap, this.options.defaultValueResolver);
    }
}

export type Version = string;
export type VersionResolver<V extends Version, SRC = any> =
    (keyof SRC) | ((o: SRC) => V);

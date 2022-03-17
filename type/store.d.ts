export interface ICacheData {
    innerHTML: string;
    files: object;
}
export declare const cacheMap: Map<string, ICacheData>;
export declare function removeCache(id: string | undefined): void;

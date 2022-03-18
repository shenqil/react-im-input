import { IFilePayload } from './interface';
export interface ICacheData {
    innerHTML: string;
    files: any;
}
export declare const cacheMap: Map<string, ICacheData>;
export declare function saveHTML(id: string, html: string): void;
export declare function getCacheItem(id: string): ICacheData;
export declare function saveFile(id: string, fileid: string, file: IFilePayload): void;
export declare function getFile(id: string, fileid: string): IFilePayload | undefined;
export declare function removeCache(id: string | undefined): void;

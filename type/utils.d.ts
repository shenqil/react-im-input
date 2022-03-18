import { EMsgItem } from './interface';
/**
 * 通过html解析出消息列表
 * */
export declare function getMsgListByNode(el: Node | null, findFile: Function, result?: EMsgItem[]): EMsgItem[];
export declare function getBackImg(): Promise<unknown>;
export declare function uuid(): string;
/**
 * fileToBase64
 * */
export declare function fileToBase64(file: File): Promise<unknown>;
declare const _default: {
    getMsgListByNode: typeof getMsgListByNode;
};
export default _default;

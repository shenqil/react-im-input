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
/**
 * 获取对应文件的图标
 * */
export declare function getFileIcon(fileName: string): any;
/**
 * 截取字符串
 * */
export declare function cutstr(str: string, len: number): string;
export declare function bytesConver(num: number): string;
declare const _default: {
    getMsgListByNode: typeof getMsgListByNode;
};
export default _default;

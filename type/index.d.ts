import React from 'react';
import { IEmojiItem, IMemberItem, EMsgItem } from './interface';
import './index.scss';
/**
 * 暴露给外面调用的方法
 * */
export interface IIMRef {
    sendMsg: () => void;
    insertEmoji: (emoji: IEmojiItem) => void;
    setInnerHTML: (v: string) => void;
    getInnerHTML: () => string;
}
export interface IIMInputProps {
    handleSend: (list: EMsgItem[]) => void;
    onRef: React.Ref<IIMRef>;
    memberList: IMemberItem[];
}
export interface IIMProps extends IIMInputProps {
}
declare const _default: (props: IIMProps) => JSX.Element;
export default _default;

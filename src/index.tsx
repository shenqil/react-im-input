/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {
  forwardRef, useRef, useImperativeHandle, KeyboardEvent, RefObject,
} from 'react';
import { IEmojiItem } from './interface';
import { getMsgListByNode } from './utils';
import './index.scss';

export interface IIMProps{
  handleSend:Function
}
export interface IIMRef{
  sendMsg:Function,
  insertEmoji:Function
}
const IMInput = forwardRef((props:IIMProps, ref:React.ForwardedRef<IIMRef>) => {
  const { handleSend } = props;

  const editPanelRef = useRef<HTMLDivElement>(null);
  const { focus, backupFocus } = useCursor(editPanelRef);

  // 暴露出来的方法
  useImperativeHandle(ref, () => ({
    sendMsg,
    insertEmoji,
  }));

  /**
   * 发送消息
   * */
  function sendMsg() {
    if (editPanelRef.current) {
      const msgList = getMsgListByNode(editPanelRef.current);
      handleSend(msgList);
      editPanelRef.current.innerHTML = '';
    }
  }

  /**
   * 插入表情
   * */
  function insertEmoji(emoji:IEmojiItem) {
    focus();

    const img = `<img src='${emoji.data}' alt=${emoji.key} title=${emoji.key} style="vertical-align:-6px; display: inline-block; width: 25px; height: 25px;">`;
    document.execCommand('insertHTML', false, img);

    backupFocus();
  }

  function onKeyDown(e:KeyboardEvent<HTMLDivElement>) {
    // 按下确认键
    if (e.code === 'Enter') {
      // 没有按下shift,或者当前显示群成员弹窗，都阻止输入
      if (!e.shiftKey) {
        e.preventDefault();
      }
    }
  }

  function onKeyUp(e:KeyboardEvent<HTMLDivElement>) {
    backupFocus();

    // 抬起确认键
    if (e.code === 'Enter' && !e.shiftKey) {
      sendMsg();
    }
  }

  return (
    <div className="react-im-input">

      {/* 输入框内容区 */}
      <div className="react-im-input__container">
        <div
          ref={editPanelRef}
          contentEditable="true"
          onFocus={() => {}}
          onKeyUp={onKeyUp}
          onKeyDown={onKeyDown}
          onClick={() => backupFocus()}
          role="textbox"
          aria-hidden
          className="react-im-input__container-inner"
        />
      </div>

    </div>
  );
});

/**
 * 光标Hook处理函数
 * */
function useCursor(editPanelRef:RefObject<HTMLDivElement>) {
  const lastEditRangeRef = useRef<Range | undefined>(undefined);

  // 获取光标
  function focus() {
    // 获取焦点
    editPanelRef.current?.focus();

    // 存在上一次光标位置，则还原光标位置
    if (lastEditRangeRef.current) {
      const selection = getSelection();
      selection?.removeAllRanges();
      selection?.addRange(lastEditRangeRef.current);
    }
  }

  // 备份光标
  function backupFocus() {
    // 获取选定对象
    const selection = getSelection();
    // 设置最后光标对象
    lastEditRangeRef.current = selection?.getRangeAt(0);
  }

  return {
    focus,
    backupFocus,
  };
}

export default IMInput;

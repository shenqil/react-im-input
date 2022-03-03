/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {
  forwardRef, useRef, useImperativeHandle, KeyboardEvent,
} from 'react';
import { getMsgListByNode } from './utils';
import './index.scss';

export interface IIMProps{
  handleSend:Function
}
export interface IIMRef{
  sendMsg:Function
}
const IMInput = forwardRef((props:IIMProps, ref:React.ForwardedRef<IIMRef>) => {
  const { handleSend } = props;

  const editPanelRef = useRef<HTMLDivElement>(null);

  // 暴露出来的方法
  useImperativeHandle(ref, () => ({
    sendMsg,
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

  function onKeyUp(e:KeyboardEvent<HTMLDivElement>) {
    // 抬起确认键
    if (e.code === 'Enter') {
      sendMsg();
    }
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
          role="textbox"
          aria-hidden
          className="react-im-input__container-inner"
        />
      </div>

    </div>
  );
});

export default IMInput;

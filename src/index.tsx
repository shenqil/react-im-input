import React, { useRef } from 'react';
import BaseInput from './components/BaseInput';
import { getMsgListForNode } from './utils';
import './index.scss';

export interface IIMProps{
  handleSend:Function
}
export default function IMInput(props:IIMProps) {
  const { handleSend } = props;
  const editPanelRef = useRef<HTMLDivElement>(null); // 定义编辑框的引用

  function sendMsg() {
    if (editPanelRef.current) {
      const msgList = getMsgListForNode(editPanelRef.current);
      editPanelRef.current.innerHTML = '';
      handleSend(msgList);
    }
  }

  return (
    <div className="react-im-input">
      {/* 输入框区域 */}
      <BaseInput ref={editPanelRef} />

      {/* 底部发送 */}
      <div className="react-im-input__btn">
        <div
          className="react-im-input__btn--inner"
          onClick={() => sendMsg()}
          aria-hidden="true"
        >
          发送
        </div>
      </div>
    </div>
  );
}

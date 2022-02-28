import React, { useRef } from 'react';
import BaseInput from './components/BaseInput';
import './index.scss';

export interface IIMProps{
  handleSend:Function
}
export default function IMInput(props:IIMProps) {
  const { handleSend } = props;
  const editPanelRef = useRef<HTMLDivElement>(null); // 定义编辑框的引用
  return (
    <div className="react-im-input">
      <BaseInput ref={editPanelRef} />

      {/* 底部发送 */}
      <div className="react-im-input__btn">
        <div
          className="react-im-input__btn--inner"
          onClick={() => handleSend()}
          aria-hidden="true"
        >
          发送
        </div>
      </div>
    </div>
  );
}

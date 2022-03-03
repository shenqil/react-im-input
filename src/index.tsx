import React, { forwardRef, useRef, useImperativeHandle } from 'react';
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

  // 暴露出来的方法
  useImperativeHandle(ref, () => ({
    sendMsg,
  }));

  return (
    <div className="react-im-input">

      {/* 输入框内容区 */}
      <div className="react-im-input__container">
        <div
          ref={editPanelRef}
          contentEditable="true"
          className="react-im-input__container-inner"
        />
      </div>

    </div>
  );
});

export default IMInput;

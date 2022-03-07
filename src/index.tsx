/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {
  useRef,
  useState,
  useImperativeHandle,
  KeyboardEvent,
  RefObject,
  FormEvent,
  CompositionEvent,
} from 'react';
import { IEmojiItem, IMemberItem } from './interface';
import { getMsgListByNode } from './utils';
import { MemberContextProvider } from './context';
import PopupMenu, { IPopupMenuRef } from './components/PopupMenu';
import './index.scss';

/**
 * 暴露给外面调用的方法
 * */
export interface IIMRef{
  sendMsg:Function,
  insertEmoji:Function
}

export interface IIMInputProps{
  handleSend:Function,
  onRef:React.Ref<IIMRef>,
  memberList:IMemberItem[]
}

function IMInput(props:IIMInputProps) {
  const { handleSend, onRef, memberList } = props;

  const editPanelRef = useRef<HTMLDivElement>(null);
  const popupMenuRef = useRef<IPopupMenuRef>(null);
  const isComposition = useRef(false);

  const { focus, backupFocus } = useCursor(editPanelRef);
  const {
    coordinate,
    filterValue,
    updateFilterValue,
    showPopupMenu,
    hidePopupMenu,
  } = usePopupMenu(editPanelRef, popupMenuRef);

  // 暴露出来的方法
  useImperativeHandle(onRef, () => ({
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

  /**
   * 插入群成员
   * */
  function insertMember(name:string) {
    focus();

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i <= filterValue.length; i++) {
      document.execCommand('Delete');
    }

    const div = `<div style="display: inline-block;"><span class="react-im-input--red" contenteditable="false">@${name}</span>&nbsp;</div>`;
    document.execCommand('insertHTML', false, div);

    backupFocus();
  }

  /**
   * 用户点击成员
   * */
  function onClickGroupMember(item:IMemberItem) {
    insertMember(item.name);
  }

  function onKeyDown(e:KeyboardEvent<HTMLDivElement>) {
    // 按下确认键
    if (e.code === 'Enter') {
      // 没有按下shift,或者当前显示群成员弹窗，都阻止输入
      if (!e.shiftKey) {
        e.preventDefault();
      }
    }

    // 按下 esc
    if (e.code === 'Escape') {
      hidePopupMenu();
    }

    // 拦截上下键
    if (popupMenuRef.current?.isShow()) {
      if (e.code === 'ArrowUp') {
        popupMenuRef.current.activeIndexAdd();
        e.preventDefault();
      }

      if (e.code === 'ArrowDown') {
        popupMenuRef.current.activeIndexMinus();
        e.preventDefault();
      }
    }
  }

  function onKeyUp(e:KeyboardEvent<HTMLDivElement>) {
    backupFocus();

    // 抬起确认键
    if (e.code === 'Enter') {
      if (popupMenuRef.current?.isShow()) {
        popupMenuRef.current.enterMember();
      } else if (!e.shiftKey) {
        sendMsg();
      }
    }
  }

  function onCompositionStart() {
    isComposition.current = true;
  }

  function onCompositionEnd(e:CompositionEvent<HTMLDivElement>) {
    const { data, inputType } = e as unknown as InputEvent;
    isComposition.current = false;
    // 中文完毕更新过滤值
    updateFilterValue(data, inputType);
  }

  function onInput(e:FormEvent<HTMLDivElement>) {
    const { data, inputType } = e.nativeEvent as InputEvent;

    // 存在成员列表
    if (memberList.length) {
      if (data === '@') {
        // 创建一个img用来描述光所在位置
        const aiteID = `aite${Date.now()}`;
        const div = `<img id="${aiteID}" style="display: inline-block; width: 0px; height: 0px;">`;
        document.execCommand('insertHTML', false, div);
        // 拿到用于定位的imgdom
        const aiteDom = document.querySelector(`#${aiteID}`);
        coordinate.current.offsetLeft = (aiteDom as HTMLElement).offsetLeft;
        coordinate.current.offsetTop = (aiteDom as HTMLElement).offsetTop;

        // 定位完成后删除
        document.execCommand('Delete');

        backupFocus();

        showPopupMenu();
      } else if (!isComposition.current) {
        // 非中文输入，实时更新过滤值
        updateFilterValue(data, inputType);
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
          onClick={() => backupFocus()}
          onBlur={() => backupFocus()}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          onInput={onInput}
          role="textbox"
          aria-hidden
          className="react-im-input__container-inner"
        />
      </div>

      {/* @弹出框 */}
      <PopupMenu
        onRef={popupMenuRef}
        filterValue={filterValue}
        onClickGroupMember={(item:IMemberItem) => onClickGroupMember(item)}
      />
    </div>
  );
}

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

/**
 * 弹窗Hook处理函数
 * */
function usePopupMenu(
  editPanelRef:RefObject<HTMLDivElement>,
  popupMenuRef:RefObject<IPopupMenuRef>,
) {
  // 记录过滤值
  const filterValueRef = useRef('');
  const [filterValue, setFilterValue] = useState('');
  // 记录坐标状态
  const coordinate = useRef({
    offsetLeft: 0,
    offsetTop: 0,
  });
  /**
   * 更新过滤值
   * */
  function updateFilterValue(data:string | null, inputType:string) {
    if (!popupMenuRef.current?.isShow()) {
      return;
    }
    if (data) {
      filterValueRef.current += data;
      setFilterValue(filterValueRef.current);
    } else if (inputType === 'deleteContentBackward') {
      // 删除键
      if (filterValueRef.current.length > 0) {
        filterValueRef.current = filterValueRef.current.slice(0, -1);
        setFilterValue(filterValueRef.current);
      }

      if (!filterValueRef.current) {
        // 过滤值被清空，关闭群@弹窗
        hidePopupMenu();
      }
    }
  }

  /**
   * 显示弹窗
   * */
  function showPopupMenu() {
    let left = coordinate.current.offsetLeft;

    if (!editPanelRef.current || !popupMenuRef.current) {
      return;
    }

    const top = coordinate.current.offsetTop - editPanelRef.current.scrollTop;

    if (left + 166 > editPanelRef.current.clientWidth) {
      left -= 166;
    }

    // 清空过滤值
    filterValueRef.current = '';
    setFilterValue('');

    popupMenuRef.current?.show(left, top);
  }

  /**
   * 隐藏窗口
   * */
  function hidePopupMenu() {
    popupMenuRef.current?.hide();
  }

  return {
    coordinate,
    filterValue,
    updateFilterValue,
    showPopupMenu,
    hidePopupMenu,
  };
}
export interface IIMProps extends IIMInputProps{
}
const createIMInput = (Com:any) => (props:IIMProps) => {
  const { memberList } = props;
  return (
    <MemberContextProvider value={memberList}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Com {...props} />
    </MemberContextProvider>
  );
};
export default createIMInput(IMInput);

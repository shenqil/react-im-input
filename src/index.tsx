import React, {
  useRef,
  useState,
  useImperativeHandle,
  KeyboardEvent,
  RefObject,
  FormEvent,
  CompositionEvent,
  useEffect,
} from 'react';
import {
  IEmojiItem, IMemberItem, EMsgItem, IFilePayload,
} from './interface';
import {
  getMsgListByNode, uuid, fileToBase64, getFileIcon, getBackImg, cutstr, bytesConver,
} from './utils';
import { MemberContextProvider } from './context';
import PopupMenu, { IPopupMenuRef } from './components/PopupMenu';
import {
  cacheMap, saveHTML, getCacheItem, removeCache, saveFile, getFile,
} from './store';
import './index.scss';

export const clearCache:(id:string | undefined)=>void = removeCache;

/**
 * 暴露给外面调用的方法
 * */
export interface IIMRef{
  sendMsg:() => void,
  insertEmoji:(emoji: IEmojiItem) => void,
  setInnerHTML:(v: string) => void,
  getInnerHTML:() => string,
  insertImg:(file:IFilePayload)=>void,
  insertFile:(file:IFilePayload)=>void
}

export interface IIMInputProps{
  inputId?:string,
  handleSend:(list:EMsgItem[])=>void,
  onRef:React.Ref<IIMRef>,
  memberList:IMemberItem[]
}

function IMInput(props:IIMInputProps) {
  const {
    handleSend = () => {}, onRef, memberList = [], inputId,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
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
  } = usePopupMenu(containerRef, editPanelRef, popupMenuRef);
  const {
    insertEmoji,
    insertMember,
    insertImg,
    insertFile,
  } = useInsert({
    id: inputId || '', backupFocus, focus, filterValue,
  });

  useCache({ id: inputId, getInnerHTML, setInnerHTML });

  // 暴露出来的方法
  useImperativeHandle(onRef, () => ({
    sendMsg,
    insertEmoji,
    insertImg,
    insertFile,
    setInnerHTML,
    getInnerHTML,
  }));

  /**
   * 发送消息
   * */
  function sendMsg() {
    if (editPanelRef.current) {
      const msgList = getMsgListByNode(editPanelRef.current, (fileId:string) => getFile(inputId || '', fileId));
      handleSend(msgList);
      clearCache(inputId || '');
      editPanelRef.current.innerHTML = '';
    }
  }

  /**
   * 用户点击成员
   * */
  function onClickGroupMember(item:IMemberItem) {
    insertMember(item.name);
  }

  /**
   * 设置输入框InnerHTML
   * */
  function setInnerHTML(v:string) {
    if (!editPanelRef.current) {
      return;
    }
    editPanelRef.current.innerHTML = '';
    focus();
    document.execCommand('insertHTML', false, v);

    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }

    backupFocus();
  }

  /**
   * 获取输入框InnerHTML
   * */
  function getInnerHTML() {
    return editPanelRef.current?.innerHTML || '';
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

  function onDrop(e:React.DragEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    const { dataTransfer } = e.nativeEvent as DragEvent;
    if (!dataTransfer?.files || !dataTransfer?.files.length) {
      return;
    }

    const imgReg = /\.(jpg|jpeg|png|bmp)$/i;
    for (const file of dataTransfer.files) {
      const filePayload:IFilePayload = {
        fileRealName: file.name,
        fileSize: file.size,
        type: file.type,
        localPath: (file as any).path, // electron 扩展属性
        file,
      };

      if (imgReg.test(file.name)) {
        // 图片类型
        insertImg(filePayload);
      } else {
        // 文件类型
        insertFile(filePayload);
      }
    }
  }

  function onFocus() {
    if (editPanelRef.current !== document.activeElement) {
      focus();
    }
  }

  return (
    <div className="react-im-input">

      {/* 输入框内容区 */}
      <div
        ref={containerRef}
        onClick={() => onFocus()}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        className="react-im-input__container"
        aria-hidden
      >
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
  containerRef:RefObject<HTMLDivElement>,
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
      if (!filterValueRef.current) {
        // 过滤值被清空，关闭群@弹窗
        hidePopupMenu();
      }

      // 删除键
      if (filterValueRef.current.length > 0) {
        filterValueRef.current = filterValueRef.current.slice(0, -1);
        setFilterValue(filterValueRef.current);
      }
    }
  }

  /**
   * 显示弹窗
   * */
  function showPopupMenu() {
    let left = coordinate.current.offsetLeft;

    if (!editPanelRef.current || !popupMenuRef.current || !containerRef.current) {
      return;
    }

    const top = coordinate.current.offsetTop - containerRef.current.scrollTop;

    if (left + 166 > containerRef.current.clientWidth) {
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

/**
 * 缓存Hook处理
 * */
interface ICache{
  id:string | undefined,
  setInnerHTML:Function,
  getInnerHTML:Function
}
function useCache(
  {
    id,
    setInnerHTML,
    getInnerHTML,
  }:ICache,
) {
  const oldId = useRef<string | undefined>('');

  useEffect(() => {
    // 缓存旧数据
    if (oldId.current) {
      saveHTML(oldId.current, getInnerHTML());
    }

    if (id && id !== oldId.current) {
      // 设置新数据
      const curItem = getCacheItem(id);
      setInnerHTML(curItem.innerHTML);
    } else {
      setInnerHTML('');
    }

    oldId.current = id;

    return () => {
      if (id) {
        const curItem = cacheMap.get(id);
        if (curItem) {
          // 存在才缓存，否则是被人清理，不用再次缓存
          curItem.innerHTML = getInnerHTML();
          cacheMap.set(id, curItem);
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
}

/**
 * 输入框插入Hook处理函数
 * */
interface IInsert{
  focus:Function,
  backupFocus:Function,
  filterValue:string,
  id:string
}
function useInsert(
  {
    focus,
    backupFocus,
    filterValue,
    id,
  }:IInsert,
) {
  function insert(callBack:(uid:string)=>string) {
    focus();

    const uid = uuid();
    document.execCommand('insertHTML', false, callBack(uid));
    setTimeout(() => {
      const item = document.getElementById(uid);
      item?.scrollIntoView({ block: 'end', inline: 'nearest' });
    });

    backupFocus();
  }

  /**
   * 插入表情
   * */
  function insertEmoji(emoji:IEmojiItem) {
    insert((uid) => `<img id=${uid} src='${emoji.data}' alt=${emoji.key} title=${emoji.key} style="vertical-align:-6px; display: inline-block; width: 25px; height: 25px;">`);
  }

  /**
   * 插入群成员
   * */
  function insertMember(name:string) {
    insert((uid) => {
      for (let i = 0; i <= filterValue.length; i++) {
        document.execCommand('Delete');
      }
      return `<span id=${uid} class="react-im-input--red" contenteditable="false">@${name}</span>&nbsp;`;
    });
  }

  /**
   * 插入图片
   * */
  async function insertImg(file:IFilePayload) {
    let src = file.localPath || file.localPath || '';
    if (!src && file.file) {
      src = await fileToBase64(file.file) as string;
    }
    insert((uid) => {
      saveFile(id, uid, file);
      return `<img src=${src} id=${uid} title='img'  style="vertical-align:-6px; display: inline-block; max-width: 200px; max-height: 200px;">`;
    });
  }

  /**
   * 插入文件
   * */
  async function insertFile(file:IFilePayload) {
    // 1096 190
    const canvas = document.createElement('canvas');
    canvas.width = 252;
    canvas.height = 72;

    const backImg = await getBackImg() as HTMLImageElement;
    const iconImg = new Image();
    iconImg.src = getFileIcon(file.fileRealName);

    iconImg.onload = () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(backImg, 0, 0, 252, 72);
        ctx.drawImage(iconImg, 203, 15, 34, 41);
        ctx.font = '14px 微软雅黑';
        ctx.fillText(cutstr(file.fileRealName, 15), 30, 25);
        ctx.font = '12px 微软雅黑';
        ctx.fillText(`${bytesConver(file.fileSize)}`, 30, 55); // 选择位置
      }

      const b64 = canvas.toDataURL('image/jpeg', 0.9);

      insert((uid) => {
        saveFile(id, uid, file);
        return `<img src=${b64} id=${uid} title='file' style="vertical-align:-6px; display: inline-block; width: 252px; height: 72px;">`;
      });

      backupFocus();
    };
  }

  return {
    insertEmoji,
    insertMember,
    insertImg,
    insertFile,
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

/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {
  useMemo,
  useContext,
  useState,
  useImperativeHandle,
  CSSProperties,
  useRef,
  useLayoutEffect,
  useEffect,
} from 'react';
import pinyinMatch from 'pinyin-match';
import memberContext from '../../context';
import { IMemberItem } from '../../interface';
import './index.scss';

/**
 * 暴露给外面的属性和方法
 * */
export interface IPopupMenuRef{
  show:Function,
  hide:Function,
  isShow:Function,
  activeIndexAdd:Function,
  activeIndexMinus:Function,
  enterMember:Function
}
export interface IPopupMenuProps {
  filterValue:string,
  onClickGroupMember:Function,
  onRef:React.Ref<IPopupMenuRef>
}

function PopupMenu(props:IPopupMenuProps) {
  const { filterValue, onClickGroupMember, onRef } = props;

  const curHtmlRef = useRef<HTMLDivElement>(null);

  const {
    filterMemberList,
  } = useFilterMember(filterValue);

  const {
    memberActiveIndex,
    setMemberActive,
    activeIndexAdd,
    activeIndexMinus,
  } = useMemberActive(filterMemberList);

  const {
    style,
    show,
    hide,
    isShow,
  } = useStyles(curHtmlRef, filterMemberList, filterValue, setMemberActive);

  // 暴露出来的方法和属性
  useImperativeHandle(onRef, () => ({
    show,
    hide,
    isShow,
    activeIndexAdd,
    activeIndexMinus,
    enterMember,
  }));

  useEffect(() => {
    window.addEventListener('click', hide);
    return () => {
      window.removeEventListener('click', hide);
    };
  }, [hide]);

  function handleClickMember(item:IMemberItem) {
    onClickGroupMember(item);
    hide();
  }

  function enterMember() {
    if (memberActiveIndex < filterMemberList.length) {
      handleClickMember(filterMemberList[memberActiveIndex]);
    } else {
      hide();
    }
  }

  return (
    <div
      ref={curHtmlRef}
      style={style}
      className="react-im-input-popup-menu"
    >
      {
        !!filterMemberList.length && (
          <ul className="react-im-input-popup-menu__inner">
            {
              filterMemberList
                .map((member, index) => (
                  <li
                    key={member.id}
                    className={`react-im-input-popup-menu__item 
                    ${index === memberActiveIndex
                    && 'react-im-input-popup-menu__item--active'}`}
                    onMouseOver={() => setMemberActive(index)}
                    onFocus={() => {}}
                    onClick={() => handleClickMember(member)}
                    aria-hidden="true"
                  >
                    <span className="react-im-input-popup-menu__avatar">
                      <img src={member.avatar} alt="" />
                    </span>

                    <span className="react-im-input-popup-menu__name">{member.name}</span>
                  </li>
                ))
            }
          </ul>
        )
      }
    </div>
  );
}

/**
   * 将选中元素移到可视区
   * */
function moveElementsToVisible() {
  const activeDom = document.querySelector('.react-im-input-popup-menu__item--active');
  if (activeDom) {
    activeDom.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}

/**
 * 处理显示成员Hook
 * */
function useFilterMember(filterValue:string) {
  const memberList = useContext(memberContext);

  const filterMemberList = useMemo(() => {
    if (filterValue) {
      return memberList.filter((member) => pinyinMatch.match(member.name, filterValue));
    }
    return [...memberList];
  }, [memberList, filterValue]);

  return {
    filterMemberList,
  };
}

/**
 * 弹窗显隐以及定位Hook
 * */
function useStyles(
  curHtmlRef:React.RefObject<HTMLDivElement>,
  filterMemberList:IMemberItem[],
  filterValue:string,
  setMemberActive:Function,
) {
  const [display, setDisplay] = useState<CSSProperties>({ display: 'none' });
  const positionRef = useRef({ top: 0, left: 0 });
  const [position, setPosition] = useState<CSSProperties>({ top: '0px', left: '0px' });

  const style = useMemo(() => ({
    ...position,
    ...display,
  }), [position, display]);

  useLayoutEffect(() => {
    const { top, left } = positionRef.current;
    const clientHeght = curHtmlRef.current?.clientHeight || 0;
    // 重新定位
    setPosition({
      top: `${top - clientHeght - 18}px`,
      left: `${left}px`,
    });
    moveElementsToVisible();
  }, [curHtmlRef, display, positionRef, filterValue]);

  /**
   * 显示弹窗
   * */
  function show(left:number, top:number) {
    if (!filterMemberList.length) {
      return;
    }

    setMemberActive(0);// 将选中元素置为第一个

    positionRef.current.left = left;
    positionRef.current.top = top;
    setDisplay({ display: 'block' });
  }

  /**
   * 隐藏弹窗
   * */
  function hide() {
    setDisplay({ display: 'none' });
  }

  /**
   * 弹窗是否显示
   * */
  function isShow() {
    return display.display === 'block';
  }

  return {
    style,
    show,
    hide,
    isShow,
  };
}

/**
 * 选中成员 Hook
 * */
function useMemberActive(filterMemberList:IMemberItem[]) {
  const [memberActiveIndex, setMemberActiveIndex] = useState(0);

  useEffect(() => {
    setMemberActiveIndex(0);
  }, [filterMemberList]);

  useEffect(() => {
    moveElementsToVisible();
  }, [memberActiveIndex]);

  /**
   * 设置选中成员
   * */
  function setMemberActive(index:number) {
    if (index >= filterMemberList.length) {
      setMemberActiveIndex(0);
    } else {
      setMemberActiveIndex(index);
    }
  }

  /**
   * 选中成员递增
   * */
  function activeIndexAdd() {
    if (memberActiveIndex === 0) {
      setMemberActiveIndex(filterMemberList.length - 1);
    } else {
      setMemberActiveIndex(memberActiveIndex - 1);
    }
  }

  /**
   * 选中成员递减
   * */
  function activeIndexMinus() {
    if (memberActiveIndex + 1 >= filterMemberList.length) {
      setMemberActiveIndex(0);
    } else {
      setMemberActiveIndex(memberActiveIndex + 1);
    }
  }

  return {
    memberActiveIndex,
    setMemberActive,
    activeIndexAdd,
    activeIndexMinus,
  };
}

export default PopupMenu;

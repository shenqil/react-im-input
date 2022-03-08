import React from 'react';
import './index.scss';
/**
 * 暴露给外面的属性和方法
 * */
export interface IPopupMenuRef {
    show: Function;
    hide: Function;
    isShow: Function;
    activeIndexAdd: Function;
    activeIndexMinus: Function;
    enterMember: Function;
}
export interface IPopupMenuProps {
    filterValue: string;
    onClickGroupMember: Function;
    onRef: React.Ref<IPopupMenuRef>;
}
declare function PopupMenu(props: IPopupMenuProps): JSX.Element;
export default PopupMenu;

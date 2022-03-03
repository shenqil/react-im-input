import React, { useMemo, useContext, useState } from 'react';
import memberContext from '../../context';
import './index.scss';

export interface IPopupMenuProps {
  filterName:string,
  onClickGroupMember:Function,
}

function PopupMenu(props:IPopupMenuProps) {
  const { filterName, onClickGroupMember } = props;

  const [memberActionIndex, setMemberActionIndex] = useState(0);
  const memberList = useContext(memberContext);

  const filterMemberList = useMemo(() => {
    if (!filterName) {
      return [...memberList];
    }
    return memberList.filter((item) => item.name.includes(filterName));
  }, [filterName, memberList]);
  return (
    <div
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
                    ${index === memberActionIndex
                    && 'react-im-input-popup-menu__item--active'}`}
                    onMouseOver={() => setMemberActionIndex(index)}
                    onFocus={() => {}}
                    onClick={() => onClickGroupMember(member.name)}
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

export default PopupMenu;

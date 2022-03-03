import React, { FC, useEffect, useState } from 'react';
import {IEmojiItem} from '../src/interface'
import emojiData from './emoji.json'
import './index.scss'

export interface IEmojiContentProps {
  handleEmojiClick:Function
  hideEmoji:Function
}
const EmojiContent:FC<IEmojiContentProps> = function (props) {
  const { handleEmojiClick, hideEmoji } = props;

  function handleClick(item:IEmojiItem) {
    handleEmojiClick(item);
    hideEmoji();
  }
  return (
    <div className='emoji-content'>
      <div className='emoji-content__inner'>
        {
          emojiData
            .map((emojiItem:IEmojiItem, index) => (
              <div
                key={emojiItem.key}
                tabIndex={index}
                role="button"
                className='emoji-content__item'
                onClick={() => handleClick(emojiItem)}
                onKeyUp={() => hideEmoji()}
              >
                <img
                  className='emoji-content__item-img'
                  src={emojiItem.data || ''}
                  alt={emojiItem.key || ''}
                />
              </div>
            ))
        }
      </div>
    </div>
  );
};

export interface IEmojiProps {
  handleEmojiClick:Function
}
const Emoji:FC<IEmojiProps> = function ({ handleEmojiClick }) {
  const [visible, setVisible] = useState(false);

  function hideEmoji(){
    setVisible(false)
  }

  useEffect(()=>{
    window.addEventListener('click',hideEmoji)
    return ()=>{
      window.removeEventListener('click',hideEmoji)
    }
  },[])
  return (
    <div className='emoji'>
      <button onClick={(e)=>{
        e.stopPropagation()
        setVisible(true)
      }}>插入表情</button>

      {
        visible
        &&
        <div className='emoji_popup'>
        <EmojiContent handleEmojiClick={handleEmojiClick} hideEmoji={hideEmoji}/>
      </div>
      }

    </div>
  );
};

export default Emoji;

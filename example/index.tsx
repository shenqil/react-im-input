import React,{useState,useRef} from 'react'
import ReactDOM from 'react-dom';
import './index.scss'
import IMInput,{IIMRef} from '../src/index'
import {EMsgItem,IEmojiItem} from '../src/interface'
import Emoji from './emoji'

function App(){
  const [out,setOut] = useState<EMsgItem[]>([])
  const imInputRef = useRef<IIMRef>(null)

  function sendMsg(list:EMsgItem[]){
    setOut(list)
  }

  function handleEmojiClick(item:IEmojiItem){
    imInputRef.current?.insertEmoji(item)
  }

  return (
    <div className='example'>

      <div className='example_tools'>
        <Emoji handleEmojiClick={handleEmojiClick}/>
      </div>

      <div className='example_input'>
        <IMInput handleSend={sendMsg}  ref={imInputRef}/>
      </div>

      <div className="example_btn">
          <div
            className="example_btn--inner"
            aria-hidden="true"
            onClick={()=>imInputRef.current?.sendMsg()}
          >
            发送
          </div>
      </div>

      <ul className='example_out'>
        {out.map((item,index)=>
        (<li key={index}>
          {JSON.stringify(item)}
          </li>)
        )}
      </ul>
    </div>
    )
}


ReactDOM.render(<App />,document.getElementById('root'));

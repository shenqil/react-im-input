import React,{useState,useRef} from 'react'
import ReactDOM from 'react-dom';
import './index.scss'
import IMInput,{IIMRef} from '../src/index'
import {EMsgItem,IEmojiItem,IMemberItem} from '../src/interface'
import Emoji from './emoji'

import img1 from './img/1.jpg'
import img2 from './img/2.jpg'
import img3 from './img/3.jpg'
import img4 from './img/4.jpg'
import img5 from './img/5.jpg'
import img6 from './img/6.jpg'

function App(){
  const [out,setOut] = useState<EMsgItem[]>([])
  const imInputRef = useRef<IIMRef>(null)
  const memberList = useMemberList()

  const {
    id,
    clickConversation1,
    clickConversation2,
    clearConversation1,
    clearAll
  } = useCache(imInputRef)

  function sendMsg(list:EMsgItem[]){
    setOut(list)
  }

  function handleEmojiClick(item:IEmojiItem){
    imInputRef.current?.insertEmoji(item)
  }

  function setHTML(){
    imInputRef.current?.setInnerHTML('设置InnerHTML<div>1111</div>')
  }

  function getHTML(){
    setOut([imInputRef.current?.getInnerHTML() as any])
  }

  return (
    <div className='example'>

      <div className='example_tools'>
        <div>原生Dom操作:        
          <button onClick={()=>setHTML()}>设置InnerHTML</button>
          <button onClick={()=>getHTML()}>获取InnerHTML</button>
        </div>
        <div>缓存:
          <button onClick={()=>clickConversation1()}>会话1</button>
          <button onClick={()=>clickConversation2()}>会话2</button>
          <button onClick={()=>clearConversation1()}>清除会话1输入框缓存</button>
          <button onClick={()=>clearAll()}>清除所有缓存</button>
        </div>
        <div>插入:
          <Emoji handleEmojiClick={handleEmojiClick}/>
        </div>
      </div>

      <div className='example_input'>
        <IMInput 
          inputId={id}
          memberList={memberList as IMemberItem[]} 
          handleSend={sendMsg}  
          onRef={imInputRef}
        />
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


function useMemberList(){
  return [
    {id:'1',name:'德玛西亚之力',avatar:img1},
    {id:'2',name:'陆克萨斯之手',avatar:img2},
    {id:'3',name:'刀锋意志',avatar:img3},
    {id:'4',name:'放逐之刃',avatar:img4},
    {id:'5',name:'无双剑姬',avatar:img5},
    {id:'6',name:'青钢影',avatar:img6},
    {id:'7',name:'疾风剑豪',avatar:img1},
    {id:'8',name:'盲僧',avatar:img2},
    {id:'9',name:'提莫',avatar:img3},
    {id:'10',name:'嘉文四世',avatar:img4},
    {id:'11',name:'德邦总管',avatar:img5},
  ]
}

function useCache(imInputRef:React.MutableRefObject<IIMRef>){
  const [id,setId] = useState('conversation1')
  function clickConversation1(){
    setId('conversation1')
  }

  function clickConversation2(){
    setId('conversation2')
  }

  function clearConversation1(){
    imInputRef.current.clearCache('conversation1')
  }

  function clearAll(){
    imInputRef.current.clearCache(undefined)
  }

  return {
    id,
    clickConversation1,
    clickConversation2,
    clearConversation1,
    clearAll
  }
}

ReactDOM.render(<App />,document.getElementById('root'));

import React,{useState,useRef} from 'react'
import ReactDOM from 'react-dom';
import './index.scss'
import IMInput,{IIMRef} from '../src/index'
import {EMsgItem,IEmojiItem} from '../src/interface'
import Emoji from './emoji'

function App(){
  const [out,setOut] = useState<EMsgItem[]>([])
  const imInputRef = useRef<IIMRef>(null)
  const memberList = useMemberList()

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
        <IMInput 
          memberList={memberList} 
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
    {id:'1',name:'德玛西亚之力'},
    {id:'2',name:'陆克萨斯之手'},
    {id:'3',name:'刀锋意志'},
    {id:'4',name:'放逐之刃'},
    {id:'5',name:'无双剑姬'},
    {id:'6',name:'青钢影'},
    {id:'7',name:'疾风剑豪'},
    {id:'8',name:'盲僧'},
    {id:'9',name:'提莫'},
    {id:'10',name:'嘉文四世'},
    {id:'11',name:'德邦总管'},
  ]
}

ReactDOM.render(<App />,document.getElementById('root'));

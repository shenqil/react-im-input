import React,{useState,useRef} from 'react'
import ReactDOM from 'react-dom';
import './index.scss'
import IMInput,{IIMRef} from '../src/index'
import {EMsgItem} from '../src/interface'

function App(){
  const [out,setOut] = useState<EMsgItem[]>([])
  const imInputRef = useRef<IIMRef>(null)
  function sendMsg(list:EMsgItem[]){
    console.log(list,'sendMsg')
    setOut(list)
  }
  return (
    <div className='example'>
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

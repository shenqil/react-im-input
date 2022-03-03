import React,{useState} from 'react'
import ReactDOM from 'react-dom';
import './index.scss'
import IMInput from '../src/index'
import {EMsgItem} from '../src/interface'

function App(){
  const [out,setOut] = useState<EMsgItem[]>([])
  function sendMsg(list:EMsgItem[]){
    console.log(list,'sendMsg')
    setOut(list)
  }
  return (
    <div className='example'>
      <div className='example_input'>
        <IMInput handleSend={sendMsg}/>
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

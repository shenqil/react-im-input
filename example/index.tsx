import React from 'react'
import ReactDOM from 'react-dom';
import './index.scss'
import IMInput from '../src/index'

function App(){
  return (
    <div className='example'>
      <div className='example_input'>
        <IMInput />
      </div>
    </div>
    )
}


ReactDOM.render(<App />,document.getElementById('root'));

import React, {  useState } from 'react'
import ReactDOM from 'react-dom';

import Diallog from '../src/index'

function App(){
  const [isShowDialog,setIsShowDialog] = useState(false)
  return (
    <div>
      <h3>DialogPage</h3>
      <button onClick={() => setIsShowDialog(true)}>
          toggle
      </button>
      {isShowDialog && <Diallog children="hello" hideDialog={() => setIsShowDialog(false)} />}
    </div>
    )
}


ReactDOM.render(<App />,document.getElementById('root'));

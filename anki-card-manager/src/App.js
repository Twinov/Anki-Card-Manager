import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import 'antd/dist/antd.css'

import Home from './views/Home'
import Chinese from './views/Chinese'
import Japanese from './views/Japanese'

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route exact path='/chinese' component={Chinese} />
        <Route exact path='/japanese' component={Japanese} />
      </Switch>
    </BrowserRouter>
  )
}

export default App

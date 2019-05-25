import React from 'react'
import makeTinyapp from '@scriptless/tinyapp'
import App from './components/App'

export default makeTinyapp({
  title: 'CRUD Example',
  render: () => <App />,
})

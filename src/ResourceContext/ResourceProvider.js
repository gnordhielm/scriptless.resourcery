import React, { useReducer } from 'react'
import ResourcesContext from './index'
const ResourceProvider = ({ children }) => {
  const [store, dispatch] = useReducer(reducer, {})

  const value = {}

  return (
    <ResourcesContext.Provider value={value}>
      {children}
    </ResourcesContext.Provider>
  )
}

ResourceProvider.displayName = 'ResourceProvider'

export default ResourceProvider

import { createContext, useState } from 'react'

export const DebugContext = createContext();

const DebugContextProvider = props => {
  const [debug, setDebug] = useState([])

  return <DebugContext.Provider value={{ debug, setDebug }}>{props.children}</DebugContext.Provider>;
};

export default DebugContextProvider;
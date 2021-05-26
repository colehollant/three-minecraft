import { createContext, useState } from 'react'
export const SceneContext = createContext();

const SceneContextProvider = props => {
  window.iter = 0
  const [objects, setObjects] = useState([])
  return <SceneContext.Provider value={{ objects, setObjects }}>{props.children}</SceneContext.Provider>;
};

export default SceneContextProvider;
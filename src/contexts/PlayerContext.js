import { createContext, useState } from 'react'
export const PlayerContext = createContext();

const PlayerContextProvider = props => {
  const [position, setPosition] = useState({x: 0, y: 0, z: 0})
  return <PlayerContext.Provider value={{ position, setPosition }}>{props.children}</PlayerContext.Provider>;
};

export default PlayerContextProvider;
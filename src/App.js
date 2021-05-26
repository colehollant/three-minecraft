import './App.css';
import { useEffect, useState, useRef, useContext, Suspense } from 'react'
import { Canvas, extend, useLoader } from '@react-three/fiber'
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
// import PlayerContextProvider, { PlayerContext } from './contexts/PlayerContext'
import SceneContextProvider, { SceneContext } from './contexts/SceneContext'
import Controls from './components/controls'
import { makeNoise3D } from 'fast-simplex-noise'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { Text } from "troika-three-text"
import { gridSize, boxSize } from './config'

extend({ PointerLockControls, Text })


const noise = makeNoise3D()
const map = Array.from({length: gridSize}).map((_, x) => Array.from({length: gridSize}).map((_, y) => {
  const z = Math.round(noise(x / 10, y / 10, 0))
  return z
}))

const centerCoords = {
  x: gridSize * boxSize / 2,
  y: 80,
  z: gridSize * boxSize / 2,
}



export default function App() {
  return (
    <>
    <MinecraftScene />
    <DebugWindow />
    <CrossHair />
    </>
  )
}

function MinecraftScene() {
  return (
    <div id="canvas-container">
      <Canvas>
      <Suspense fallback={null}>
        {/* <PlayerContextProvider> */}
      <SceneContextProvider>
        <ambientLight intensity={0.075} />
        <pointLight color={0xc9ae34} position={[centerCoords.x, centerCoords.y, centerCoords.z]} />
        <mesh position={[centerCoords.x, centerCoords.y, centerCoords.z]}>
          <boxGeometry args={[2, 2, 2]}/>
          <meshPhongMaterial />
        </mesh>
        <Boxes />
        <Controls />
        </SceneContextProvider>
        {/* </PlayerContextProvider> */}
        </Suspense>
      </Canvas>
    </div>
  )
}

function DebugWindow() {
  const [debug, setDebug] = useState({})
  useEffect(() => {
    window.requestAnimationFrame(() => {
      setDebug(JSON.parse(localStorage.getItem('debug')))
    })
  })
  return (
    <div className="debug">
      <div>Controls:</div>
      <div>WASD to move</div>
      <div>mouse to look</div>
      <div>space to jump</div>
      <div>click to lock cursor</div>
      <div>esc or u to unlock cursor</div>
      <div>e to fly</div>
      <pre><code>state: {JSON.stringify(debug, null, 2)}</code></pre>
    </div>
  )
}
function CrossHair() {
  return (
    <div className="crosshair">
      <p>+</p>
    </div>
  )
}

function Boxes() {
  const translate = {
    y: -20
  }
  const { setObjects } = useContext(SceneContext)
  const ref = useRef({})
  useEffect(() => {
    setObjects(ref.current)
  }, [ref, setObjects])
  const [textureTop, textureSide, textureBottom] = useLoader(TextureLoader, [
    '/images/grass-top.jpeg',
    '/images/grass-side.jpeg',
    '/images/grass-bottom.jpeg'
  ])

  // const [rotation, setRotation] = useState([0, 0, 90, 0]);
  // const [opts, setOpts] = useState({
  //   font: "Philosopher",
  //   fontSize: 2,
  //   color: "#99ccff",
  //   maxWidth: 300,
  //   lineHeight: 1,
  //   letterSpacing: 0,
  //   textAlign: "justify",
  //   materialType: "MeshPhongMaterial"
  // });

  // const [indexes, setIndexes] = useState([])
  // useFrame(() => {
  //   setIndexes(indexesToCheck(position, 5))
  // })

  return (
    <>
      {[...Array.from({length: gridSize}).map((_, x) => Array.from({length: gridSize}).map((_, y) => {
          const z = map[x][y]
          const res = (
            <>
            <mesh position={[x * boxSize, (z * boxSize) + translate.y, (y * boxSize)]} key={[x, y].join()} ref={element => {ref.current[x + (y * gridSize)] = element}}>
              <boxGeometry args={[boxSize, boxSize, boxSize]} attach="geometry" />             
              <meshStandardMaterial map={textureSide} attachArray="material" />
              <meshStandardMaterial map={textureSide} attachArray="material" />
              <meshStandardMaterial map={textureTop} attachArray="material" />
              <meshStandardMaterial map={textureBottom} attachArray="material" />
              <meshStandardMaterial map={textureSide} attachArray="material" />
              <meshStandardMaterial map={textureSide} attachArray="material" />
            </mesh>
            
            <mesh position={[x * boxSize, (z * boxSize) + translate.y - boxSize, (y * boxSize)]} key={[x, y,2].join()} ref={element => {ref.current[x + (y * gridSize) + (gridSize * gridSize)] = element}}>
              <boxGeometry args={[boxSize, boxSize, boxSize]} attach="geometry" />             
              <meshStandardMaterial map={textureSide} attach="material" />
            </mesh>
            {/* {indexes.includes(x + (y * gridSize)) &&
            <text
              position={[x * boxSize, (z * boxSize) + translate.y + boxSize, (y * boxSize)]}
              rotation={rotation}
              {...opts}
              text={`${x + (y * gridSize)}`}
              font={fonts[opts.font]}
              anchorX="center"
              anchorY="middle"
            >
              {opts.materialType === "MeshPhongMaterial" ? (
                <meshPhongMaterial attach="material" color={opts.color} />
              ) : null}
            </text>
            } */}
          </>
          )
          return res
      }))]}
    </>
  )
}


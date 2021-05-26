import { Raycaster, Vector3 } from 'three'
import { useEffect, useState, useRef, useContext } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { SceneContext } from '../contexts/SceneContext'
import { PlayerContext } from '../contexts/PlayerContext'
import { gridSize, boxSize, indexesToCheck } from '../config'

const playerHeight = 4
const groundLevel = -50
const terminalVelocity = -20
const mass = 10
const gravity = 9.8
const speed = {
  walking: 0.3,
  running: 0.5,
}




export default function Controls() {
  const [doUpdateVelocity, setDoUpdateVelocity] = useState(true)
  const [movementSpeed, setMovementSpeed] = useState(speed.walking)
  const [position, setCameraPosition] = useState({x: 0, y: 0, z: 0})
  const { objects } = useContext(SceneContext)
  const { setPosition } = useContext(PlayerContext)
  const { camera, gl } = useThree()
  const ref = useRef()
  const [prevTime, setPrevTime] = useState(performance.now())
  const [jumping, setJumping] = useState(true)
  const [onObject, setOnObject] = useState(false)
  const [velocity, setVelocity] = useState({
    forward: 0,
    right: 0,
    y: 0,
  })
  const handlers = () => {
    const unrestrictedJump = () => {
      setVelocity(velocity => ({ ...velocity, y: 50 }))
      setJumping(true)
    }
    const jump = () => {
      if(onObject && !jumping) {
        setVelocity(velocity => ({ ...velocity, y: 35 }))
        setJumping(true)
      }
    }
    const listeners = {
      mousedown: () => {
        ref.current.lock()
      },
      keypress: ({ key }) => {
        key = key.toLowerCase()
        const actions = {
          l: () => ref.current.lock(),
          u: () => ref.current.unlock(),
          c: () => console.log({current: ref.current, getObject: ref.current.getObject()}),
          i: () => {
            const playerPosition = ref.current.getObject().position
            const x = Math.round(playerPosition.x / boxSize)
            const z = Math.round(playerPosition.z / boxSize)
            const index = ((z + 1) * gridSize) - (gridSize - x)
            console.log({
              intersections: indexesToCheck(playerPosition, 1),
              index: index,
            })
          },
          e: () => unrestrictedJump(),
          ' ': () => jump(),
          p: () => setDoUpdateVelocity(doUpdateVelocity => !doUpdateVelocity),
        }
        if(actions[key]) actions[key]()
      },
      keydown: ({key}) => {
        key = key.toLowerCase()
        const actions = {
          w: () => setVelocity(velocity => ({ ...velocity, forward: movementSpeed })),
          a: () => setVelocity(velocity => ({ ...velocity, right: -movementSpeed })),
          s: () => setVelocity(velocity => ({ ...velocity, forward: -movementSpeed })),
          d: () => setVelocity(velocity => ({ ...velocity, right: movementSpeed })),
          shift: () => setMovementSpeed(speed.running)
        }
        if(actions[key]) actions[key]()
        // else console.log({key})
      },
      keyup: ({ key }) => {
        key = key.toLowerCase()
        const actions = {
          w: () => setVelocity(velocity => ({ ...velocity, forward:0 })),
          a: () => setVelocity(velocity => ({ ...velocity, right: 0 })),
          s: () => setVelocity(velocity => ({ ...velocity, forward: 0 })),
          d: () => setVelocity(velocity => ({ ...velocity, right:0 })),
          shift: () => setMovementSpeed(speed.walking)
        }
        if(actions[key]) actions[key]()
      }
    }
    window.addEventListener('mousedown', listeners.mousedown)
    window.addEventListener('keypress', listeners.keypress)
    window.addEventListener('keydown', listeners.keydown)
    window.addEventListener('keyup', listeners.keyup)

    return function() {
      window.removeEventListener('mousedown', listeners.mousedown)
    window.removeEventListener('keypress', listeners.keypress)
    window.removeEventListener('keydown', listeners.keydown)
    window.removeEventListener('keyup', listeners.keyup)
    }
  }
  useEffect(handlers, [jumping, onObject, movementSpeed])
  
  useFrame(() => {
    ref.current.getObject().far = 100
    ref.current.getObject().updateProjectionMatrix()
    const currentPosition = ref.current.getObject().position
    let raycaster = new Raycaster( new Vector3(), new Vector3( 0, - 1, 0 ), 0, 2)
    raycaster.ray.origin.copy( currentPosition )
    raycaster.ray.origin.y -= playerHeight
    // const gridSize = 30
    const possibleIntersections = indexesToCheck(currentPosition, 1)
    const intersections = raycaster.intersectObjects( possibleIntersections.map(i => objects[i]) )
    // const intersections = raycaster.intersectObjects( Object.values(objects) )
    setOnObject(intersections.length > 0 || currentPosition.y <= groundLevel)
    const land = () => {
      setVelocity(velocity => ({...velocity, y: 0}))
      setJumping(false)
    }
    const time = performance.now()
    const delta = ( time - prevTime ) / 1000
    ref.current.moveForward(velocity.forward)
    ref.current.moveRight(velocity.right)
    if(jumping) {
      currentPosition.y = Math.max((velocity.y * delta) + currentPosition.y, groundLevel)
    }
    const acceleration = gravity * mass * delta
    
    if(doUpdateVelocity) setVelocity(velocity => ({ ...velocity, y: Math.max(velocity.y - acceleration, terminalVelocity)}))
    else setVelocity(velocity => ({ ...velocity, y: 0}))
    setPrevTime(time)
    if(onObject && velocity.y === terminalVelocity) land()
    if(!onObject && !jumping) {
      setVelocity(velocity => ({ ...velocity, y: 0}))
      setJumping(true)
    }
    setCameraPosition(currentPosition)
    setPosition(currentPosition)
    localStorage.setItem('debug', JSON.stringify({
      currentRef: currentPosition,
      shouldReset: currentPosition.y < groundLevel,
      jumping,
      onObject,
      canJump: onObject && !jumping,
      movementSpeed
    }))
  })

  return (
    <>
    <pointerLockControls ref={ref} args={[camera, gl.domElement]} />
    <pointLight color={0xffffff} position={[position.x, position.y, position.z]} intensity={0.1} decay={2} />
    </>
  )
}


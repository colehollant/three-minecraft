const gridSize = 30
const boxSize = 3
const indexesToCheck = (playerPosition, checkingRadius = 1) => {
  const maxIndex = gridSize * gridSize * 2
  const x = Math.round(playerPosition.x / boxSize)
  const z = Math.round(playerPosition.z / boxSize)
  const index = ((z + 1) * gridSize) - (gridSize - x)
  const res = []
  for(let i = -checkingRadius; i <= checkingRadius; i++) {
    const offset = i * gridSize
    for(let j = -checkingRadius; j <= checkingRadius; j++) {
      const toCheck = index + offset + j
      const toCheckBelow = index + offset + j + (gridSize * gridSize)
      if(toCheck > 0 && toCheck < maxIndex) res.push(toCheck)
      if(toCheckBelow > 0 && toCheckBelow < maxIndex) res.push(toCheckBelow)
    }
  }
  return res
}

module.exports = {
  gridSize,
  boxSize,
  indexesToCheck
}
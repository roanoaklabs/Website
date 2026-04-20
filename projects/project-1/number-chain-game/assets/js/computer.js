// assets/js/computer.js
// Computer opponent logic for Number Chain

import { getValidMoves, getPlayerCells, getExtensionCells } from './game.js';

export function makeComputerMove(grid, playerNumber) {
  const playerCells = getPlayerCells(grid, playerNumber);
  
  if (playerCells.length === 0) {
    return null;
  }
  
  const cellsWithExtensions = playerCells.filter(index => 
    getExtensionCells(grid, index, playerNumber).length > 0
  );
  
  if (cellsWithExtensions.length === 0) {
    return null;
  }
  
  const randomFromIndex = cellsWithExtensions[Math.floor(Math.random() * cellsWithExtensions.length)];
  const extensions = getExtensionCells(grid, randomFromIndex, playerNumber);
  const randomToIndex = extensions[Math.floor(Math.random() * extensions.length)];
  
  return { fromIndex: randomFromIndex, toIndex: randomToIndex };
}

export function scheduleComputerMove(callback, delay = 800) {
  setTimeout(callback, delay);
}

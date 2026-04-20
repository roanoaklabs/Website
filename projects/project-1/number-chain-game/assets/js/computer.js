// assets/js/computer.js
// Computer opponent logic for Number Chain

import { getValidMoves, getPlayerChainTips } from './game.js';

export function makeComputerMove(grid, playerNumber) {
  const validMoves = getValidMoves(grid, playerNumber);
  
  if (validMoves.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex];
}

export function scheduleComputerMove(callback, delay = 800) {
  setTimeout(callback, delay);
}

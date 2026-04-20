// assets/js/game.js
// Core game logic for Number Chain

import { GRID_SIZE, getCellIndex, getCellPosition, getAdjacentCells } from './config.js';

export function initializeGrid() {
  return Array(GRID_SIZE * GRID_SIZE).fill(null).map(() => ({
    player: 0,
    value: 0
  }));
}

export function setupInitialPositions(grid) {
  const newGrid = [...grid];
  
  newGrid[getCellIndex(0, 0)] = { player: 1, value: 1 };
  newGrid[getCellIndex(1, 1)] = { player: 1, value: 2 };
  newGrid[getCellIndex(2, 2)] = { player: 1, value: 3 };
  
  newGrid[getCellIndex(5, 5)] = { player: 2, value: 1 };
  newGrid[getCellIndex(4, 4)] = { player: 2, value: 2 };
  newGrid[getCellIndex(3, 3)] = { player: 2, value: 3 };
  
  return newGrid;
}

export function getNextNumber(grid, playerNumber) {
  const playerCells = grid.filter(cell => cell.player === playerNumber && cell.value > 0);
  if (playerCells.length === 0) return 1;
  return Math.max(...playerCells.map(c => c.value)) + 1;
}

export function getPlayerChainTips(grid, playerNumber) {
  const tips = [];
  const nextNum = getNextNumber(grid, playerNumber);
  
  grid.forEach((cell, index) => {
    if (cell.player === playerNumber && cell.value === nextNum - 1) {
      const { row, col } = getCellPosition(index);
      const adjacent = getAdjacentCells(row, col);
      
      let hasValidExtension = false;
      for (const adj of adjacent) {
        const adjIndex = getCellIndex(adj.row, adj.col);
        if (grid[adjIndex].value === 0) {
          hasValidExtension = true;
          break;
        }
      }
      
      if (hasValidExtension) {
        tips.push(index);
      }
    }
  });
  
  return tips;
}

export function getValidMoves(grid, playerNumber) {
  const tips = getPlayerChainTips(grid, playerNumber);
  const validMoves = [];
  
  for (const tipIndex of tips) {
    const { row, col } = getCellPosition(tipIndex);
    const adjacent = getAdjacentCells(row, col);
    
    for (const adj of adjacent) {
      const adjIndex = getCellIndex(adj.row, adj.col);
      if (grid[adjIndex].value === 0) {
        validMoves.push(adjIndex);
      }
    }
  }
  
  return validMoves;
}

export function canPlaceNumber(grid, index, playerNumber) {
  if (grid[index].value !== 0) return false;
  
  const validMoves = getValidMoves(grid, playerNumber);
  return validMoves.includes(index);
}

export function placeNumber(grid, index, playerNumber) {
  const newGrid = [...grid];
  const nextNum = getNextNumber(newGrid, playerNumber);
  newGrid[index] = {
    player: playerNumber,
    value: nextNum
  };
  return newGrid;
}

export function hasValidMoves(grid, playerNumber) {
  return getValidMoves(grid, playerNumber).length > 0;
}

export function isBoardFull(grid) {
  return grid.every(cell => cell.value !== 0);
}

export function isGameOver(grid) {
  return isBoardFull(grid);
}

export function calculateFinalResults(grid) {
  const p1Max = getMaxChainNumber(grid, 1);
  const p2Max = getMaxChainNumber(grid, 2);
  
  let winner;
  if (p1Max > p2Max) {
    winner = 1;
  } else if (p2Max > p1Max) {
    winner = 2;
  } else {
    winner = 0;
  }
  
  return {
    maxNumbers: { 1: p1Max, 2: p2Max },
    winner: winner
  };
}

export function getMaxChainNumber(grid, playerNumber) {
  const playerCells = grid.filter(cell => cell.player === playerNumber && cell.value > 0);
  if (playerCells.length === 0) return 0;
  return Math.max(...playerCells.map(c => c.value));
}

export function getCurrentNextNumbers(grid) {
  return {
    1: getNextNumber(grid, 1),
    2: getNextNumber(grid, 2)
  };
}

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
  const playerCells = getPlayerCells(grid, playerNumber);
  const validMoves = [];
  
  for (const cellIndex of playerCells) {
    const extensions = getExtensionCells(grid, cellIndex, playerNumber);
    validMoves.push(...extensions);
  }
  
  return validMoves;
}

export function canPlaceNumber(grid, index, playerNumber) {
  if (grid[index].value !== 0) return false;
  
  const validMoves = getValidMoves(grid, playerNumber);
  return validMoves.includes(index);
}

export function getPlayerCells(grid, playerNumber) {
  const cells = [];
  grid.forEach((cell, index) => {
    if (cell.player === playerNumber && cell.value > 0) {
      cells.push(index);
    }
  });
  return cells;
}

export function getExtensionCells(grid, cellIndex, playerNumber) {
  const cell = grid[cellIndex];
  if (!cell || cell.player !== playerNumber || cell.value === 0) {
    return [];
  }
  
  const { row, col } = getCellPosition(cellIndex);
  const adjacent = getAdjacentCells(row, col);
  const extensions = [];
  
  for (const adj of adjacent) {
    const adjIndex = getCellIndex(adj.row, adj.col);
    if (grid[adjIndex].value === 0) {
      extensions.push(adjIndex);
    }
  }
  
  return extensions;
}

export function canExtendFrom(grid, cellIndex, playerNumber) {
  return getExtensionCells(grid, cellIndex, playerNumber).length > 0;
}

export function placeNumberFrom(grid, fromIndex, toIndex, playerNumber) {
  const fromValue = grid[fromIndex].value;
  const newValue = fromValue + 1;
  
  const newGrid = [...grid];
  newGrid[toIndex] = {
    player: playerNumber,
    value: newValue
  };
  return newGrid;
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

export function bothPlayersHaveNoMoves(grid) {
  const p1Moves = getValidMoves(grid, 1);
  const p2Moves = getValidMoves(grid, 2);
  return p1Moves.length === 0 && p2Moves.length === 0;
}

export function shouldEndGameEarly(grid) {
  const p1Max = getMaxChainNumber(grid, 1);
  const p2Max = getMaxChainNumber(grid, 2);
  const p1Moves = getValidMoves(grid, 1);
  const p2Moves = getValidMoves(grid, 2);
  
  if (p1Moves.length === 0 && p2Max > p1Max) return true;
  if (p2Moves.length === 0 && p1Max > p2Max) return true;
  
  return false;
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
  const p1Max = getMaxChainNumber(grid, 1);
  const p2Max = getMaxChainNumber(grid, 2);
  return {
    1: p1Max > 0 ? p1Max : '-',
    2: p2Max > 0 ? p2Max : '-'
  };
}

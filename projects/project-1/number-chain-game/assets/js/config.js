// assets/js/config.js
// Configuration and constants for Number Chain game

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBp8iDGPfzH84iGw0WGmDSp0QJfwTpTDdU",
  authDomain: "memory-game-21ee5.firebaseapp.com",
  databaseURL: "https://memory-game-21ee5-default-rtdb.firebaseio.com",
  projectId: "memory-game-21ee5",
  storageBucket: "memory-game-21ee5.appspot.com",
  messagingSenderId: "616933567051",
  appId: "1:616933567051:web:b1f215ae7dced7270bbbce"
};

export const GRID_SIZE = 6;

export const PLAYER_COLORS = {
  1: '#3b82f6',
  2: '#ef4444'
};

export const ROOM_CODE_ADJECTIVES = [
  'PRIME', 'ODD', 'EVEN', 'REAL', 'POSITIVE',
  'NEGATIVE', 'WHOLE', 'RATIONAL'
];

export const ROOM_CODE_NOUNS = [
  'ADD', 'SUB', 'MULT', 'DIV', 'MOD',
  'POW', 'LOG', 'SIN', 'PI'
];

export const GAME_MODES = {
  LOCAL: 'local',
  ONLINE: 'online',
  VS_COMPUTER_EASY: 'vs-computer-easy'
};

export function getAdjacentCells(row, col) {
  const adjacent = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
        adjacent.push({ row: newRow, col: newCol });
      }
    }
  }
  return adjacent;
}

export function getCellIndex(row, col) {
  return row * GRID_SIZE + col;
}

export function getCellPosition(index) {
  return {
    row: Math.floor(index / GRID_SIZE),
    col: index % GRID_SIZE
  };
}

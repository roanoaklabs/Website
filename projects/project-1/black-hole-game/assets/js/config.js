// assets/js/config.js
// Configuration and constants for Black Hole game

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBp8iDGPfzH84iGw0WGmDSp0QJfwTpTDdU",
  authDomain: "memory-game-21ee5.firebaseapp.com",
  databaseURL: "https://memory-game-21ee5-default-rtdb.firebaseio.com",
  projectId: "memory-game-21ee5",
  storageBucket: "memory-game-21ee5.appspot.com",
  messagingSenderId: "616933567051",
  appId: "1:616933567051:web:b1f215ae7dced7270bbbce"
};

// Pyramid Structure - defines how many circles in each row and their indices
export const PYRAMID_STRUCTURE = [
  { row: 0, count: 1, startIndex: 0 },   // Top: 1 circle
  { row: 1, count: 2, startIndex: 1 },   // 2 circles
  { row: 2, count: 3, startIndex: 3 },   // 3 circles
  { row: 3, count: 4, startIndex: 6 },   // 4 circles
  { row: 4, count: 5, startIndex: 10 },  // 5 circles
  { row: 5, count: 6, startIndex: 15 }   // Bottom: 6 circles
];

// Adjacency Map - defines which circles are connected to each other
// This is used to calculate scores (sum of numbers adjacent to black hole)
export const ADJACENCY_MAP = {
  0: [1, 2],
  1: [0, 2, 3, 4],
  2: [0, 1, 4, 5],
  3: [1, 4, 6, 7],
  4: [1, 2, 3, 5, 7, 8],
  5: [2, 4, 8, 9],
  6: [3, 7, 10, 11],
  7: [3, 4, 6, 8, 11, 12],
  8: [4, 5, 7, 9, 12, 13],
  9: [5, 8, 13, 14],
  10: [6, 11, 15, 16],
  11: [6, 7, 10, 12, 16, 17],
  12: [7, 8, 11, 13, 17, 18],
  13: [8, 9, 12, 14, 18, 19],
  14: [9, 13, 19, 20],
  15: [10, 16],
  16: [10, 11, 15, 17],
  17: [11, 12, 16, 18],
  18: [12, 13, 17, 19],
  19: [13, 14, 18, 20],
  20: [14, 19]
};

// Player Colors
export const PLAYER_COLORS = {
  1: '#3b82f6',  // Blue
  2: '#ef4444'   // Red
};

// Room code generation words
export const ROOM_CODE_ADJECTIVES = [
  'BLUE', 'RED', 'GREEN', 'GOLD', 'PINK', 
  'COOL', 'FAST', 'BOLD', 'DARK', 'BRIGHT'
];

export const ROOM_CODE_NOUNS = [
  'STAR', 'MOON', 'VOID', 'COSMOS', 'NEBULA', 
  'COMET', 'ORBIT', 'QUASAR', 'PULSAR', 'GALAXY'
];

// Game Constants
export const TOTAL_CIRCLES = 21;
export const MAX_NUMBER = 10;  // Each player places numbers 1-10

// Game Modes
export const GAME_MODES = {
  LOCAL: 'local',
  ONLINE: 'online',
  VS_COMPUTER_EASY: 'vs-computer-easy'
};
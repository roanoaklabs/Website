// assets/js/game.js
// Core game logic for Black Hole

import { ADJACENCY_MAP, TOTAL_CIRCLES } from './config.js';

// Initialize empty game board
export function initializeCircles() {
  return Array(TOTAL_CIRCLES).fill(null).map(() => ({
    player: 0,  // Use 0 instead of null (Firebase removes null values)
    value: 0    // Use 0 instead of null
  }));
}

// Calculate the score for a player
// Score = sum of player's numbers adjacent to the black hole
export function calculateScore(circles, playerNumber) {
  const blackHoleIndex = circles.findIndex(c => c.player === 0 && c.value === 0);
  
  if (blackHoleIndex === -1) return 0;
  
  const adjacentIndices = ADJACENCY_MAP[blackHoleIndex] || [];
  let sum = 0;
  
  adjacentIndices.forEach(index => {
    if (circles[index].player === playerNumber) {
      sum += circles[index].value;
    }
  });
  
  return sum;
}

// Check if game is over (only 1 empty circle remaining = black hole)
export function isGameOver(circles) {
  const emptyCircles = circles.filter(c => c.value === 0);
  return emptyCircles.length === 1;
}

// Get the next number for a player to place
export function getNextNumber(circles, playerNumber) {
  const playerCircles = circles.filter(c => c.player === playerNumber);
  return playerCircles.length + 1;
}

// Check if a circle can be clicked
export function canPlaceNumber(circle, gameOver) {
  if (gameOver) return false;
  if (circle.value !== 0) return false;  // Can only place if empty (value is 0)
  return true;
}

// Place a number in a circle
export function placeNumber(circles, index, playerNumber, nextNumber) {
  const newCircles = [...circles];
  newCircles[index] = {
    player: playerNumber,
    value: nextNumber
  };
  return newCircles;
}

// Calculate final scores and determine winner
export function calculateFinalResults(circles) {
  const score1 = calculateScore(circles, 1);
  const score2 = calculateScore(circles, 2);
  
  let winner;
  if (score1 < score2) {
    winner = 1;
  } else if (score2 < score1) {
    winner = 2;
  } else {
    winner = 0; // Tie
  }
  
  return {
    scores: { 1: score1, 2: score2 },
    winner: winner
  };
}

// Get the index of the black hole
export function getBlackHoleIndex(circles) {
  return circles.findIndex(c => c.player === 0 && c.value === 0);
}
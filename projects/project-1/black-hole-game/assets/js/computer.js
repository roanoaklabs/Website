// assets/js/computer.js
// Computer opponent logic for Black Hole

/**
 * Find all empty circles (where a number can be placed)
 * @param {Array} circles - The current game board
 * @returns {Array} - Array of indices of empty circles
 */
function getEmptyCircles(circles) {
  const empty = [];
  circles.forEach((circle, index) => {
    if (circle.value === 0) {
      empty.push(index);
    }
  });
  return empty;
}

/**
 * Easy mode: Pick a random empty circle
 * @param {Array} circles - The current game board
 * @returns {number|null} - Index of chosen circle, or null if no moves available
 */
export function makeRandomMove(circles) {
  const emptyCircles = getEmptyCircles(circles);
  
  if (emptyCircles.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * emptyCircles.length);
  return emptyCircles[randomIndex];
}

/**
 * Schedule the computer's move with a delay (so it doesn't feel instant)
 * @param {Function} callback - Function to call when delay is complete
 * @param {number} delay - Delay in milliseconds (default 800ms)
 */
export function scheduleComputerMove(callback, delay = 800) {
  setTimeout(callback, delay);
}
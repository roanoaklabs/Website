// assets/js/game.js
// Game logic for Memory Game

import { THEMES, GRID_SIZES } from './config.js';

export function getTheme(themeKey) {
    return THEMES[themeKey] || THEMES.fruits;
}

export function getGridSize(sizeKey) {
    return GRID_SIZES[sizeKey] || GRID_SIZES['4x4'];
}

export function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function initializeCards(gridSizeKey, themeKey) {
    const size = getGridSize(gridSizeKey);
    const symbols = getTheme(themeKey);
    
    const selectedSymbols = shuffle([...symbols]).slice(0, size.pairs);
    
    const cardSymbols = [];
    for (let i = 0; i < size.pairs; i++) {
        cardSymbols.push(selectedSymbols[i], selectedSymbols[i]);
    }
    
    return shuffle(cardSymbols);
}

export function createCardElement(symbol, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.symbol = symbol;
    card.dataset.index = index;
    
    card.innerHTML = `
        <div class="card-face card-back">?</div>
        <div class="card-face card-front">${symbol}</div>
    `;
    
    return card;
}

export function checkForMatch(card1, card2) {
    return card1.dataset.symbol === card2.dataset.symbol;
}

export function isGameOver(matchedPairs, totalPairs) {
    return matchedPairs === totalPairs;
}

export function getMatchedPairsCount() {
    return document.querySelectorAll('.card.matched').length / 2;
}

export function getRandomTheme() {
    const themeKeys = Object.keys(THEMES);
    return themeKeys[Math.floor(Math.random() * themeKeys.length)];
}

export function getRandomGridSize() {
    const sizeKeys = Object.keys(GRID_SIZES);
    return sizeKeys[Math.floor(Math.random() * sizeKeys.length)];
}

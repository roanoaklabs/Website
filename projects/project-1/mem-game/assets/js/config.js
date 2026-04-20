// assets/js/config.js
// Configuration and constants for Memory Game

export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBp8iDGPfzH84iGw0WGmDSp0QJfwTpTDdU",
    authDomain: "memory-game-21ee5.firebaseapp.com",
    databaseURL: "https://memory-game-21ee5-default-rtdb.firebaseio.com",
    projectId: "memory-game-21ee5",
    storageBucket: "memory-game-21ee5.appspot.com",
    messagingSenderId: "616933567051",
    appId: "1:616933567051:web:b1f215ae7dced7270bbbce"
};

export const THEMES = {
    fruits: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍒', '🍑', '🥝', '🍉', '🍍', '🥭', '🍐', '🥥', '🍋', '🫐', '🍈', '🥑', '🍅'],
    dinosaurs: ['🦕', '🦖', '🦴', '🦎', '🐊', '🐢', '🦏', '🦘', '🐉', '🦤', '🐲', '🦒', '🐍', '🦎', '🐸', '🦂', '🕷️', '🦗'],
    trucks: ['🚚', '🚛', '🚜', '🚗', '🚙', '🚕', '🚐', '🚒', '🚓', '🚑', '🏎️', '🚌', '🚎', '🏍️', '🛵', '🚲', '🛴', '🚂'],
    space: ['🚀', '🛸', '🌟', '⭐', '🌙', '🪐', '🌍', '👽', '🛰️', '☄️', '🌌', '🔭', '🌠', '🌕', '🌎', '🌏', '☀️', '✨'],
    faces: ['😀', '🥰', '😏', '😭', '😡', '🤢', '😱', '🥳', '🤯', '😴', '🤓', '🤗', '😵', '🤐', '🥺', '🤪', '😇', '🤤']
};

export const GRID_SIZES = {
    '3x4': { rows: 4, cols: 3, pairs: 6 },
    '4x4': { rows: 4, cols: 4, pairs: 8 },
    '4x5': { rows: 5, cols: 4, pairs: 10 },
    '5x6': { rows: 6, cols: 5, pairs: 15 },
    '6x6': { rows: 6, cols: 6, pairs: 18 }
};

export const ROOM_CODE_ADJECTIVES = ['BLUE', 'RED', 'GREEN', 'GOLD', 'PINK', 'COOL', 'FAST', 'BOLD'];

export const ROOM_CODE_NOUNS = ['TIGER', 'EAGLE', 'SHARK', 'WOLF', 'BEAR', 'LION', 'HAWK', 'DRAGON'];

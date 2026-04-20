// assets/js/computer.js
// Computer AI for Memory Game

export function getComputerMemory(computerMemory, computerMemoryTurns, turnNumber, difficulty) {
    if (difficulty === 'easy') {
        const recentMemory = {};
        for (const [index, symbol] of Object.entries(computerMemory)) {
            if (turnNumber - computerMemoryTurns[index] <= 4) {
                recentMemory[index] = symbol;
            }
        }
        return recentMemory;
    } else {
        return computerMemory;
    }
}

export function findKnownPair(memory) {
    const allCards = document.querySelectorAll('.card:not(.matched)');
    const symbolLocations = {};

    for (const card of allCards) {
        const index = card.dataset.index;
        if (memory[index] !== undefined) {
            const symbol = memory[index];
            if (!symbolLocations[symbol]) {
                symbolLocations[symbol] = [];
            }
            symbolLocations[symbol].push(card);
        }
    }

    for (const symbol in symbolLocations) {
        if (symbolLocations[symbol].length >= 2) {
            return [symbolLocations[symbol][0], symbolLocations[symbol][1]];
        }
    }

    return null;
}

export function makeComputerMove(difficulty, computerMemory, computerMemoryTurns, turnNumber) {
    const allCards = document.querySelectorAll('.card:not(.matched)');
    const memory = getComputerMemory(computerMemory, computerMemoryTurns, turnNumber, difficulty);
    
    const knownPairs = findKnownPair(memory);
    
    let card1, card2;
    
    if (knownPairs) {
        [card1, card2] = knownPairs;
        return { card1, card2, strategy: 'known-pair' };
    }
    
    const unseenCards = Array.from(allCards).filter(c => !memory[c.dataset.index]);
    
    if (unseenCards.length >= 2) {
        card1 = unseenCards[0];
        card2 = unseenCards[1];
    } else if (unseenCards.length === 1) {
        card1 = unseenCards[0];
        const otherCards = Array.from(allCards).filter(c => c !== card1);
        card2 = otherCards[Math.floor(Math.random() * otherCards.length)];
    } else {
        const cardsArray = Array.from(allCards);
        card1 = cardsArray[Math.floor(Math.random() * cardsArray.length)];
        const remaining = cardsArray.filter(c => c !== card1);
        card2 = remaining[Math.floor(Math.random() * remaining.length)];
    }
    
    return { card1, card2, strategy: 'random' };
}

export function makeComputerMoveHard(computerMemory, computerMemoryTurns, turnNumber) {
    const allCards = document.querySelectorAll('.card:not(.matched)');
    const memory = getComputerMemory(computerMemory, computerMemoryTurns, turnNumber, 'hard');
    
    const knownPairs = findKnownPair(memory);
    
    if (knownPairs) {
        return { card1: knownPairs[0], card2: knownPairs[1], strategy: 'known-pair' };
    }
    
    const unseenCards = Array.from(allCards).filter(c => !memory[c.dataset.index]);
    
    let card1;
    if (unseenCards.length > 0) {
        card1 = unseenCards[0];
    } else {
        const cardsArray = Array.from(allCards);
        card1 = cardsArray[Math.floor(Math.random() * cardsArray.length)];
    }
    
    const symbol1 = card1.dataset.symbol;
    const updatedMemory = getComputerMemory(computerMemory, computerMemoryTurns, turnNumber, 'hard');
    
    let card2 = null;
    for (const card of allCards) {
        if (card === card1 || card.classList.contains('matched')) continue;
        const idx = card.dataset.index;
        if (updatedMemory[idx] === symbol1) {
            card2 = card;
            break;
        }
    }
    
    if (!card2) {
        const remainingUnseen = Array.from(allCards).filter(c => 
            c !== card1 && !updatedMemory[c.dataset.index]
        );
        
        if (remainingUnseen.length > 0) {
            card2 = remainingUnseen[0];
        } else {
            const remaining = Array.from(allCards).filter(c => c !== card1);
            card2 = remaining[Math.floor(Math.random() * remaining.length)];
        }
    }
    
    return { card1, card2, strategy: 'hard' };
}

export function executeComputerMove(card, computerMemory, computerMemoryTurns, turnNumber) {
    card.classList.add('flipped');
    const index = card.dataset.index;
    const symbol = card.dataset.symbol;
    computerMemory[index] = symbol;
    computerMemoryTurns[index] = turnNumber;
    return { memory: computerMemory, memoryTurns: computerMemoryTurns };
}

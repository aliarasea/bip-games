import { useState, useEffect, useCallback } from 'react';
import words from '../words.json';

// Turkish-specific uppercase conversion
const toTurkishUpperCase = (str: string): string => {
  return str
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .toLocaleUpperCase('tr-TR');
};

export interface GameState {
  currentWord: string;
  guessedLetters: Set<string>;
  wrongGuesses: string[];
  gameStatus: 'playing' | 'won' | 'lost';
  maxWrongGuesses: number;
}

export const useHangmanGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentWord: '',
    guessedLetters: new Set(),
    wrongGuesses: [],
    gameStatus: 'playing',
    maxWrongGuesses: 6,
  });

  // Initialize game with random word
  const initializeGame = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * words.length);
    const newWord = toTurkishUpperCase(words[randomIndex]);
    
    setGameState({
      currentWord: newWord,
      guessedLetters: new Set(),
      wrongGuesses: [],
      gameStatus: 'playing',
      maxWrongGuesses: 6,
    });
  }, []);

  // Initialize game on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Make a guess
  const makeGuess = useCallback((letter: string) => {
    const upperLetter = toTurkishUpperCase(letter);
    
    if (gameState.guessedLetters.has(upperLetter) || gameState.gameStatus !== 'playing') {
      return;
    }

    setGameState(prevState => {
      const newGuessedLetters = new Set(prevState.guessedLetters);
      newGuessedLetters.add(upperLetter);
      
      const newWrongGuesses = !prevState.currentWord.includes(upperLetter)
        ? [...prevState.wrongGuesses, upperLetter]
        : [...prevState.wrongGuesses];

      // Check win condition
      const isWon = prevState.currentWord
        .split('')
        .every(letter => newGuessedLetters.has(letter));

      // Check lose condition
      const isLost = newWrongGuesses.length >= prevState.maxWrongGuesses;

      let newGameStatus: 'playing' | 'won' | 'lost' = 'playing';
      if (isWon) newGameStatus = 'won';
      else if (isLost) newGameStatus = 'lost';

      return {
        ...prevState,
        guessedLetters: newGuessedLetters,
        wrongGuesses: newWrongGuesses,
        gameStatus: newGameStatus,
      };
    });
  }, [gameState.guessedLetters, gameState.gameStatus]);

  // Get display word with guessed letters
  const getDisplayWord = useCallback(() => {
    return gameState.currentWord
      .split('')
      .map(letter => gameState.guessedLetters.has(letter) ? letter : '_')
      .join(' ');
  }, [gameState.currentWord, gameState.guessedLetters]);

  return {
    gameState,
    makeGuess,
    initializeGame,
    getDisplayWord,
  };
};
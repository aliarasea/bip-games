import { useHangmanGame } from './hooks/useHangmanGame'
import { WordDisplay } from './components/WordDisplay'
import { HangmanDrawing } from './components/HangmanDrawing'
import { TurkishKeyboard } from './components/TurkishKeyboard'
import { GameStatus } from './components/GameStatus'
import { LostGameRestart } from './components/LostGameRestart'
import bipLogo from './assets/bip.png'
import './App.css'

function App() {
  const { gameState, makeGuess, initializeGame, getDisplayWord } = useHangmanGame();

  return (
    <div className="app">
      <header className="app-header">
        <img src={bipLogo} alt="BIP Logo" className="bip-logo" />
        <h1 className="app-title">Adam Asmaca</h1>
      </header>

      <main className="game-container">
        <div className="game-top">
          <HangmanDrawing wrongGuessesCount={gameState.wrongGuesses.length} />
        </div>

        <div className="game-middle">
          <WordDisplay 
            displayWord={getDisplayWord()} 
            gameStatus={gameState.gameStatus}
            currentWord={gameState.currentWord}
          />
          <GameStatus 
            gameStatus={gameState.gameStatus}
            onRestart={initializeGame}
          />
          <LostGameRestart 
            gameStatus={gameState.gameStatus}
            onRestart={initializeGame}
          />
        </div>

        <div className="game-bottom">
          <TurkishKeyboard 
            onLetterClick={makeGuess}
            guessedLetters={gameState.guessedLetters}
            disabled={gameState.gameStatus !== 'playing'}
          />
        </div>
      </main>
    </div>
  )
}

export default App
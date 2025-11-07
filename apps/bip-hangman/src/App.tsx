import { useState, useEffect } from 'react'
import { useHangmanGame } from './hooks/useHangmanGame'
import { WordDisplay } from './components/WordDisplay'
import { HangmanDrawing } from './components/HangmanDrawing'
import { TurkishKeyboard } from './components/TurkishKeyboard'
import { Results, type GameResultData } from '@bip-games/ui'
import bipLogo from './assets/bip.png'
import './App.css'

function App() {
  const { gameState, makeGuess, initializeGame, getDisplayWord } =
    useHangmanGame()
  const [showResults, setShowResults] = useState(false)
  const [gameResult, setGameResult] = useState<{
    isWin: boolean
    word: string
    totalGuesses: number
    wrongGuesses: number
  } | null>(null)

  // Oyun durumunu takip et ve bitince Results göster
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') {
      setGameResult({
        isWin: gameState.gameStatus === 'won',
        word: gameState.currentWord,
        totalGuesses: gameState.guessedLetters.size,
        wrongGuesses: gameState.wrongGuesses.length
      })
      setTimeout(() => setShowResults(true), 1000)
    }
  }, [
    gameState.gameStatus,
    gameState.currentWord,
    gameState.guessedLetters.size,
    gameState.wrongGuesses.length
  ])

  // Results verilerini hazırla
  const resultData: GameResultData | null = gameResult
    ? {
        gameName: 'Hangman',
        gameIcon: '🎯',
        isWin: gameResult.isWin,
        celebrationMessage: gameResult.isWin
          ? '🎉 Tebrikler!'
          : '😔 Kaybettiniz!',
        message: `Kelime: ${gameResult.word}`,
        metrics: [
          {
            label: 'Toplam Tahmin',
            value: gameResult.totalGuesses,
            icon: '🎲'
          },
          {
            label: 'Yanlış Tahmin',
            value: gameResult.wrongGuesses,
            icon: '❌'
          },
          {
            label: 'Kalan Can',
            value: `${Math.max(0, 6 - gameResult.wrongGuesses)}/6`,
            icon: '❤️'
          }
        ]
      }
    : null

  // Results gösteriliyorsa onu render et
  if (showResults && resultData) {
    return (
      <Results
        resultData={resultData}
        onPlayAgain={() => {
          setShowResults(false)
          setGameResult(null)
          initializeGame()
        }}
        onShare={() => {
          const message = `🎯 Hangman'de ${
            resultData.isWin ? 'kazandım' : 'kaybettim'
          }!\n\n🎲 Tahmin: ${gameResult?.totalGuesses}\n❌ Yanlış: ${
            gameResult?.wrongGuesses
          }\n\nSen de oyna: https://bip-hangman.netlify.app/`
          window.location.href = `bip://share?text=${encodeURIComponent(
            message
          )}`
        }}
        onShareStatus={() => {
          const statusText = `🎯 Hangman'de ${
            resultData.isWin ? 'kazandım' : 'kaybettim'
          }!`
          window.location.href = `bip://status?text=${encodeURIComponent(
            statusText
          )}`
        }}
        activeGame="Hangman"
      />
    )
  }

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

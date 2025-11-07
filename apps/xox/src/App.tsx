import { useEffect, useMemo, useState, useCallback } from 'react'
import { Results } from '@bip-games/ui'
import type {
  Player,
  GameMode,
  Difficulty,
  Board,
  GameResult,
  SquareProps,
  BoardProps,
  ConfettiOverlayProps,
  WinResult
} from './types'

/** BiP Renkleri:
 *  Mavi:   #03A9F4
 *  Sarı:   #FFD826
 *  Beyaz:  #FFFFFF
 *  Pembe:  #DF0080
 *  Mor:    #990DC6
 */

function Square({ value, onSquareClick, disabled, isWinning }: SquareProps) {
  const symbolColor =
    value === 'X'
      ? 'text-[#DF0080]'
      : value === 'O'
      ? 'text-[#990DC6]'
      : 'text-[#03A9F4]'

  return (
    <button
      onClick={onSquareClick}
      disabled={disabled}
      className={[
        'aspect-square w-full rounded-xl border border-[#CFEFFD]',
        'flex items-center justify-center',
        'text-4xl font-extrabold transition-transform relative',
        isWinning
          ? 'ring-2 ring-[#FFD826] !text-[#FFD826] -ring-offset-2 ring-offset-white animate-pulse'
          : 'bg-[#E8F6FD] shadow-sm ',
        symbolColor,
        disabled
          ? 'opacity-60 pointer-events-none'
          : 'active:scale-95 hover:bg-white'
      ].join(' ')}
      aria-label={value ? `Hücre: ${value}` : 'Boş hücre'}>
      {value}
    </button>
  )
}

function Board({ xIsNext, squares, onPlay, disableHuman }: BoardProps) {
  const result = calculateWinner(squares)
  const winner = result?.winner ?? null
  const winningLine = result?.line ?? []

  const isDraw = !winner && squares.every((v) => v !== null)

  function handleClick(i: number) {
    if (winner || squares[i]) return
    if (disableHuman) return
    const nextSquares = squares.slice()
    nextSquares[i] = xIsNext ? 'X' : 'O'
    onPlay(nextSquares)
  }

  return (
    <>
      {/* Durum Çubuğu */}
      <div className="mb-4 w-full flex items-center justify-center">
        {winner ? (
          <div
            className="inline-flex items-center gap-2 rounded-full bg-[#03A9F4]/10 px-4 py-2 text-sm font-semibold text-[#002231]"
            role="status"
            aria-live="polite">
            <span className="inline-block size-2 rounded-full bg-[#FFD826]" />
            <span>
              Kazanan:{' '}
              <span
                className={
                  winner === 'X' ? 'text-[#DF0080]' : 'text-[#990DC6]'
                }>
                {winner}
              </span>
            </span>
          </div>
        ) : isDraw ? (
          <div
            className="inline-flex items-center gap-2 rounded-full bg-[#03A9F4]/10 px-4 py-2 text-sm font-semibold text-[#002231]"
            role="status"
            aria-live="polite">
            <span className="inline-block size-2 rounded-full bg-[#03A9F4]" />
            <span>Berabere!</span>
          </div>
        ) : (
          <div
            className="inline-flex items-center gap-2 rounded-full bg-[#03A9F4]/10 px-4 py-2 text-sm font-semibold text-[#002231]"
            role="status"
            aria-live="polite">
            <span className="inline-block size-2 rounded-full bg-[#03A9F4]" />
            <span>
              Sıradaki oyuncu:{' '}
              <span className={xIsNext ? 'text-[#DF0080]' : 'text-[#990DC6]'}>
                {xIsNext ? 'X' : 'O'}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Tahta */}
      <div className="grid grid-cols-3 gap-2">
        {squares.map((val, i) => (
          <Square
            key={i}
            value={val}
            onSquareClick={() => handleClick(i)}
            disabled={disableHuman}
            isWinning={winningLine.includes(i)}
          />
        ))}
      </div>
    </>
  )
}

/* ---------- 🎉 Konfeti Bileşeni (kütüphanesiz) ---------- */
function ConfettiOverlay({ show }: ConfettiOverlayProps) {
  if (!show) return null

  // Farklı emojiler ve parçacıklar
  const emojis = ['🎉', '🎊', '✨', '💥', '🟡', '🏆', '🏅']
  const particles = Array.from({ length: 28 }).map((_, idx) => {
    const left = Math.random() * 90 // yüzde
    const delay = Math.random() * 0.4 // s
    const duration = 3 + Math.random() * 2 // 3–5 saniye arası
    const rotate = Math.random() * 360 // derece
    const size = 18 + Math.random() * 12 // px
    const emoji = emojis[idx % emojis.length]
    return { left, delay, duration, rotate, size, emoji, key: idx }
  })

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden z-10"
      aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.key}
          className="absolute top-[10%] will-change-transform"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animation: `fall ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s infinite`
          }}>
          {p.emoji}
        </span>
      ))}

      {/* Keyframes: tailwind'e özel bir sınıf yerine inline <style> ile ekliyoruz */}
      <style>{`
        @keyframes fall {
          0%   { transform: translateY(-20%) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translateY(120%) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function Game() {
  const [gameMode, setGameMode] = useState<GameMode>(null) // '1P' | '2P' | null
  const [botDifficulty, setBotDifficulty] = useState<Difficulty>(null) // 'easy' | 'medium' | 'hard' | null
  const [startingPlayer, setStartingPlayer] = useState<Player>('X') // 'X' | 'O'
  const [history, setHistory] = useState<Board[]>([Array(9).fill(null)])
  const [currentMove, setCurrentMove] = useState(0)
  const [isBotThinking, setIsBotThinking] = useState(false)

  // 🎉 Konfeti kontrolü
  const [showConfetti, setShowConfetti] = useState(false)

  // Results state
  const [showResults, setShowResults] = useState(false)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)

  // X sırası hesabı başlangıç oyuncusuna göre yapılır
  const xIsNext = useMemo(() => {
    return currentMove % 2 === 0
      ? startingPlayer === 'X'
      : startingPlayer === 'O'
  }, [currentMove, startingPlayer])

  const currentSquares = history[currentMove]
  const result = useMemo(
    () => calculateWinner(currentSquares),
    [currentSquares]
  )
  const winner = result?.winner ?? null

  const isDraw = useMemo(
    () => !winner && currentSquares.every((v) => v !== null),
    [winner, currentSquares]
  )
  const isGameOver = !!winner || isDraw

  const handlePlay = useCallback(
    (nextSquares: Board) => {
      const nextHistory = [...history.slice(0, currentMove + 1), nextSquares]
      setHistory(nextHistory)
      setCurrentMove(nextHistory.length - 1)
    },
    [history, currentMove]
  )

  // Mod seçimi
  function handleSelectMode(mode: GameMode) {
    setGameMode(mode)
    setBotDifficulty(mode === '1P' ? null : null)
    setStartingPlayer('X') // varsayılan X; 1P-hard seçilirse aşağıda O yapılacak
    setHistory([Array(9).fill(null)])
    setCurrentMove(0)
    setIsBotThinking(false)
    setShowConfetti(false)
  }

  // Zorluk seçimi
  function handleSelectDifficulty(level: Difficulty) {
    if (gameMode !== '1P') return
    if (botDifficulty !== null) return // mid-game değişimi engelle
    setBotDifficulty(level) // 'easy' | 'medium' | 'hard'
    setStartingPlayer(level === 'hard' ? 'O' : 'X') // hard ise bot başlasın
    setHistory([Array(9).fill(null)])
    setCurrentMove(0)
    setIsBotThinking(false)
    setShowConfetti(false)
  }

  function handleReset(toMode = gameMode) {
    setHistory([Array(9).fill(null)])
    setCurrentMove(0)
    setIsBotThinking(false)
    setGameMode(toMode ?? null)
    setShowConfetti(false)
    // startingPlayer aynı kalsın; hard ise yine O başlar
  }

  // 1P: Bot hamlesi (zorluk seçildiyse). Bot = 'O'
  useEffect(() => {
    if (gameMode !== '1P') return
    if (botDifficulty == null) return
    if (winner) return
    if (isDraw) return

    // Botun sırası: 'O' sırası demek => X sırası değilse
    if (xIsNext) return

    const emptyIndices = getEmptyIndices(currentSquares)
    if (emptyIndices.length === 0) return

    setIsBotThinking(true)
    const delay = setTimeout(() => {
      const idx = getBotMoveByDifficulty(currentSquares, botDifficulty)
      const randomFallback =
        emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
      const moveIndex = idx != null ? idx : randomFallback

      const next = currentSquares.slice()
      next[moveIndex] = 'O'

      setIsBotThinking(false)
      handlePlay(next)
    }, 600)

    return () => clearTimeout(delay)
  }, [
    gameMode,
    botDifficulty,
    xIsNext,
    currentSquares,
    winner,
    isDraw,
    handlePlay
  ])

  // 🎉 Kullanıcı kazanınca konfeti
  useEffect(() => {
    const userWon =
      (gameMode === '1P' && winner === 'X') || (gameMode === '2P' && !!winner)
    setShowConfetti(!!userWon) // kazanan varken açık, değilse kapalı

    // Oyun bitince Results göster
    if (isGameOver && !showResults) {
      setGameResult({
        isWin: !!winner,
        winner: winner,
        isDraw: isDraw,
        moves: currentMove,
        mode: gameMode,
        difficulty: botDifficulty
      })
      setTimeout(() => setShowResults(true), 2000)
    }
  }, [
    winner,
    gameMode,
    isGameOver,
    showResults,
    isDraw,
    currentMove,
    botDifficulty
  ])

  // Results verilerini hazırla
  const resultData = gameResult
    ? {
        gameName: 'XOX',
        gameIcon: '❌⭕',
        isWin: gameResult.isWin,
        celebrationMessage: gameResult.isDraw
          ? '🤝 Berabere!'
          : gameResult.isWin
          ? `🎉 ${gameResult.winner} Kazandı!`
          : '😔 Oyun Bitti!',
        message:
          gameResult.mode === '1P'
            ? `Zorluk: ${
                gameResult.difficulty === 'easy'
                  ? 'Kolay'
                  : gameResult.difficulty === 'medium'
                  ? 'Orta'
                  : 'Zor'
              }`
            : '2 Oyuncu Modu',
        metrics: [
          {
            label: 'Toplam Hamle',
            value: gameResult.moves,
            icon: '🎲'
          },
          {
            label: 'Oyun Modu',
            value: gameResult.mode === '1P' ? '1 Kişi' : '2 Kişi',
            icon: '🎮'
          },
          {
            label: 'Sonuç',
            value: gameResult.isDraw
              ? 'Berabere'
              : `${gameResult.winner} Kazandı`,
            icon: gameResult.isDraw ? '🤝' : '🏆'
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
          handleReset()
        }}
        onShare={() => {
          const message = `❌⭕ XOX oynadım!\n\n🎲 Hamle: ${
            gameResult?.moves
          }\n🏆 Sonuç: ${
            gameResult?.isDraw ? 'Berabere' : `${gameResult?.winner} kazandı`
          }\n\nSen de oyna: https://bip-xox-game.netlify.app/`
          window.location.href = `bip://share?text=${encodeURIComponent(
            message
          )}`
        }}
        onShareStatus={() => {
          const statusText = `❌⭕ XOX oynadım!`
          window.location.href = `bip://status?text=${encodeURIComponent(
            statusText
          )}`
        }}
        activeGame="XOX"
      />
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#E8F6FD] via-white to-white p-4">
      <div className="mx-auto max-w-sm">
        {/* Başlık */}
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-extrabold tracking-tight text-[#002231]">
            BiP XOX
          </h1>

          {gameMode !== null && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectMode('1P')}
                className={[
                  'rounded-full px-3 py-1.5 text-xs font-bold shadow transition',
                  gameMode === '1P'
                    ? 'bg-[#FFD826] text-[#002231]'
                    : 'bg-white border border-[#CFEFFD] text-[#002231] hover:bg-[#FFF7CC]'
                ].join(' ')}
                title="Tek oyuncu">
                1 Kişi
              </button>
              <button
                onClick={() => handleSelectMode('2P')}
                className={[
                  'rounded-full px-3 py-1.5 text-xs font-bold shadow transition',
                  gameMode === '2P'
                    ? 'bg-[#FFD826] text-[#002231]'
                    : 'bg-white border border-[#CFEFFD] text-[#002231] hover:bg-[#FFF7CC]'
                ].join(' ')}
                title="İki oyuncu">
                2 Kişi
              </button>
              <button
                onClick={() => handleReset()}
                className="rounded-full bg-yellow-100 hover:bg-[#FFD826] px-3 py-1.5 text-xs font-bold text-[#002231] shadow hover:brightness-105 active:scale-95 transition">
                Sıfırla
              </button>
            </div>
          )}
        </header>

        {/* Mod seçilmediyse panel */}
        {gameMode === null && (
          <div className="mb-4 rounded-xl border border-[#CFEFFD] bg-white p-4 text-center shadow-sm">
            <p className="mb-3 text-sm font-medium text-[#002231]">
              Lütfen oyun modunu seç:
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => handleSelectMode('1P')}
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#002231] border border-[#CFEFFD] hover:bg-[#FFD826] transition">
                1 Kişi
              </button>
              <button
                onClick={() => handleSelectMode('2P')}
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#002231] border border-[#CFEFFD] hover:bg-[#FFD826] transition">
                2 Kişi
              </button>
            </div>
          </div>
        )}

        {/* 1P seçilmiş ama zorluk seçilmemişse zorluk paneli */}
        {gameMode === '1P' && botDifficulty === null && (
          <div className="mb-4 rounded-xl border border-[#CFEFFD] bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-[#002231] text-center">
              Zorluk seç:
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleSelectDifficulty('easy')}
                className="rounded-full px-3 py-2 text-xs font-bold border border-[#CFEFFD] bg-white hover:bg-[#FFF7CC] transition">
                Kolay
              </button>
              <button
                onClick={() => handleSelectDifficulty('medium')}
                className="rounded-full px-3 py-2 text-xs font-bold border border-[#CFEFFD] bg-white hover:bg-[#FFF7CC] transition">
                Orta
              </button>
              <button
                onClick={() => handleSelectDifficulty('hard')}
                className="rounded-full px-3 py-2 text-xs font-bold border border-[#CFEFFD] bg-white hover:bg-[#FFF7CC] transition">
                Zor
              </button>
            </div>
          </div>
        )}

        {/* 1P ve zorluk seçildiyse rozet */}
        {gameMode === '1P' && botDifficulty !== null && (
          <div className="mb-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#03A9F4]/10 px-3 py-1 font-semibold text-[#002231]">
              <span className="inline-block size-2 rounded-full bg-[#03A9F4]" />
              Zorluk:{' '}
              {botDifficulty === 'easy'
                ? 'Kolay'
                : botDifficulty === 'medium'
                ? 'Orta'
                : 'Zor'}
            </span>
          </div>
        )}

        {/* Board (kartı relative yaptık ki konfeti üstünde aksın) */}
        {(gameMode === '2P' ||
          (gameMode === '1P' && botDifficulty !== null)) && (
          <div className="relative rounded-2xl border border-[#CFEFFD] bg-white p-4 shadow-[0_6px_20px_rgba(3,169,244,0.15)]">
            {/* 🎉 Konfeti Overlay */}
            <ConfettiOverlay show={showConfetti} />

            <Board
              xIsNext={xIsNext}
              squares={history[currentMove]}
              onPlay={handlePlay}
              disableHuman={
                isGameOver || (gameMode === '1P' && (!xIsNext || isBotThinking))
              }
            />

            {gameMode === '1P' && isBotThinking && !winner && !isDraw && (
              <p className="mt-3 text-center text-xs text-[#393C53]/70">
                🤖 Bot düşünüyor…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- Bot mantığı ve yardımcılar ---------------- */

function getEmptyIndices(squares: Board): number[] {
  return squares.map((v, i) => (v == null ? i : null)).filter((v) => v !== null)
}

function getBotMoveByDifficulty(
  squares: Board,
  difficulty: Difficulty
): number | null {
  const empties = getEmptyIndices(squares)
  if (empties.length === 0) return null

  if (difficulty === 'easy') {
    return empties[Math.floor(Math.random() * empties.length)]
  }

  if (difficulty === 'medium') {
    const winNow = findWinningMove(squares, 'O')
    if (winNow != null) return winNow

    const block = findWinningMove(squares, 'X')
    if (block != null) return block

    const priority = [4, 0, 2, 6, 8, 1, 3, 5, 7]
    for (const idx of priority) {
      if (squares[idx] == null) return idx
    }
    return empties[0]
  }

  // hard
  return bestMoveMinimax(squares, 'O')
}

function findWinningMove(squares: Board, player: Player): number | null {
  const lines = WIN_LINES
  for (const [a, b, c] of lines) {
    const line = [squares[a], squares[b], squares[c]]
    const countPlayer = line.filter((v) => v === player).length
    const countEmpty = line.filter((v) => v == null).length
    if (countPlayer === 2 && countEmpty === 1) {
      if (squares[a] == null) return a
      if (squares[b] == null) return b
      if (squares[c] == null) return c
    }
  }
  return null
}

function bestMoveMinimax(squares: Board, aiPlayer: Player): number | null {
  const human = aiPlayer === 'O' ? 'X' : 'O'
  let bestScore = -Infinity
  let move = null
  for (let i = 0; i < 9; i++) {
    if (squares[i] == null) {
      const next = squares.slice()
      next[i] = aiPlayer
      const score = minimax(next, false, 0, aiPlayer, human)
      if (score > bestScore) {
        bestScore = score
        move = i
      }
    }
  }
  return move
}

function minimax(
  squares: Board,
  isMax: boolean,
  depth: number,
  aiPlayer: Player,
  human: Player
): number {
  const outcome = terminalScore(squares, aiPlayer, human, depth)
  if (outcome != null) return outcome

  if (isMax) {
    let best = -Infinity
    for (let i = 0; i < 9; i++) {
      if (squares[i] == null) {
        const next = squares.slice()
        next[i] = aiPlayer
        best = Math.max(best, minimax(next, false, depth + 1, aiPlayer, human))
      }
    }
    return best
  } else {
    let best = +Infinity
    for (let i = 0; i < 9; i++) {
      if (squares[i] == null) {
        const next = squares.slice()
        next[i] = human
        best = Math.min(best, minimax(next, true, depth + 1, aiPlayer, human))
      }
    }
    return best
  }
}

function terminalScore(
  squares: Board,
  aiPlayer: Player,
  human: Player,
  depth: number
): number | null {
  const res = calculateWinner(squares)
  const winner = res?.winner ?? null

  if (winner === aiPlayer) return 10 - depth
  if (winner === human) return -10 + depth
  if (squares.every((v) => v != null)) return 0 // draw
  return null
}

/* ---------------- Oyun mantığı ---------------- */

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

function calculateWinner(squares: Board): WinResult | null {
  for (let i = 0; i < WIN_LINES.length; i++) {
    const [a, b, c] = WIN_LINES[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] }
    }
  }
  return null
}

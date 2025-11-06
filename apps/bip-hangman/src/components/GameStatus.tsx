interface GameStatusProps {
  gameStatus: 'playing' | 'won' | 'lost';
  onRestart: () => void;
}

export const GameStatus = ({ 
  gameStatus, 
  onRestart 
}: GameStatusProps) => {
  // Only show restart button when game is won
  if (gameStatus !== 'won') {
    return null;
  }

  return (
    <div className="game-status">
      <button 
        type="button" 
        className="restart-button" 
        onClick={onRestart}
      >
        🔄 Yeni Oyun
      </button>
    </div>
  );
};
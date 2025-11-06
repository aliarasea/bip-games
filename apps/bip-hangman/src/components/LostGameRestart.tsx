interface LostGameRestartProps {
  gameStatus: 'playing' | 'won' | 'lost';
  onRestart: () => void;
}

export const LostGameRestart = ({ gameStatus, onRestart }: LostGameRestartProps) => {
  // Only show restart button when game is lost
  if (gameStatus !== 'lost') {
    return null;
  }

  return (
    <div className="lost-game-restart">
      <button 
        type="button" 
        className="restart-button lost-restart" 
        onClick={onRestart}
      >
        🔄 Yeni Oyun
      </button>
    </div>
  );
};
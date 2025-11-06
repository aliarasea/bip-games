interface WordDisplayProps {
  displayWord: string;
  gameStatus: 'playing' | 'won' | 'lost';
  currentWord: string;
}

export const WordDisplay = ({ displayWord, gameStatus, currentWord }: WordDisplayProps) => {
  // When game is lost, show the complete word with same structure (each letter separate)
  const wordToShow = gameStatus === 'lost' 
    ? currentWord.split('').join(' ') // Convert "BILGISAYAR" to "B I L G I S A Y A R"
    : displayWord;
  const letters = wordToShow.split(' ');
  
  return (
    <div className="word-display">
      <div className={`word-container ${gameStatus}`}>
        {letters.map((letter, index) => (
          // Using a combination that makes sense for the hangman game context
          // eslint-disable-next-line react/no-array-index-key
          <span key={index} className="letter-box">
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
};
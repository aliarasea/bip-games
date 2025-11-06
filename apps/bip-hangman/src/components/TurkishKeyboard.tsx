interface TurkishKeyboardProps {
  onLetterClick: (letter: string) => void;
  guessedLetters: Set<string>;
  disabled: boolean;
}

export const TurkishKeyboard = ({ onLetterClick, guessedLetters, disabled }: TurkishKeyboardProps) => {
  // Turkish alphabet in alphabetical order - 3 rows for desktop
  const KEYBOARD_ROWS_DESKTOP = [
    ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ'],
    ['J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş'],
    ['T', 'U', 'Ü', 'V', 'Y', 'Z']
  ];

  // Turkish alphabet in alphabetical order - 4 rows for mobile
  const KEYBOARD_ROWS_MOBILE = [
    ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G'],
    ['Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M'],
    ['N', 'O', 'Ö', 'P', 'R', 'S', 'Ş'],
    ['T', 'U', 'Ü', 'V', 'Y', 'Z']
  ];

  const handleLetterClick = (letter: string) => {
    if (!disabled && !guessedLetters.has(letter)) {
      onLetterClick(letter);
    }
  };

  return (
    <>
      {/* Desktop keyboard (3 rows) */}
      <div className="turkish-keyboard turkish-keyboard-desktop">
        {KEYBOARD_ROWS_DESKTOP.map((row, rowIndex) => (
          <div key={`keyboard-row-${rowIndex}`} className="keyboard-row">
            {row.map((letter) => {
              const isGuessed = guessedLetters.has(letter);
              const isDisabled = disabled || isGuessed;
              
              return (
                <button
                  key={letter}
                  type="button"
                  className={`keyboard-key ${isGuessed ? 'guessed' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => handleLetterClick(letter)}
                  disabled={isDisabled}
                  aria-label={`Letter ${letter}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Mobile keyboard (4 rows) */}
      <div className="turkish-keyboard turkish-keyboard-mobile">
        {KEYBOARD_ROWS_MOBILE.map((row, rowIndex) => (
          <div key={`keyboard-row-mobile-${rowIndex}`} className="keyboard-row">
            {row.map((letter) => {
              const isGuessed = guessedLetters.has(letter);
              const isDisabled = disabled || isGuessed;
              
              return (
                <button
                  key={letter}
                  type="button"
                  className={`keyboard-key ${isGuessed ? 'guessed' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => handleLetterClick(letter)}
                  disabled={isDisabled}
                  aria-label={`Letter ${letter}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};
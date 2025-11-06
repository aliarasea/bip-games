interface HangmanDrawingProps {
  wrongGuessesCount: number;
}

export const HangmanDrawing = ({ wrongGuessesCount }: HangmanDrawingProps) => {
  const HEAD = (
    <div className="hangman-head" />
  );

  const BODY = (
    <div className="hangman-body" />
  );

  const LEFT_ARM = (
    <div className="hangman-left-arm" />
  );

  const RIGHT_ARM = (
    <div className="hangman-right-arm" />
  );

  const LEFT_LEG = (
    <div className="hangman-left-leg" />
  );

  const RIGHT_LEG = (
    <div className="hangman-right-leg" />
  );

  const BODY_PARTS = [HEAD, BODY, LEFT_ARM, RIGHT_ARM, LEFT_LEG, RIGHT_LEG];

  return (
    <div className="hangman-drawing">
      <div className="hangman-container">
        {/* Gallows */}
        <div className="gallows">
          <div className="top-bar" />
          <div className="vertical-bar" />
          <div className="noose" />
          <div className="base" />
        </div>
        
        {/* Body parts based on wrong guesses */}
        <div className="hangman-figure">
          {BODY_PARTS.slice(0, wrongGuessesCount)}
        </div>
      </div>
    </div>
  );
};
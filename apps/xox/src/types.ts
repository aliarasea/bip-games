export type Player = 'X' | 'O' | null;
export type GameMode = '1P' | '2P' | null;
export type Difficulty = 'easy' | 'medium' | 'hard' | null;
export type Square = Player;
export type Board = Square[];

export interface GameResult {
    isWin: boolean;
    winner: Player;
    isDraw: boolean;
    moves: number;
    mode: GameMode;
    difficulty: Difficulty;
}

export interface SquareProps {
    value: Player;
    onSquareClick: () => void;
    disabled: boolean;
    isWinning: boolean;
}

export interface BoardProps {
    xIsNext: boolean;
    squares: Board;
    onPlay: (squares: Board) => void;
    disableHuman: boolean;
}

export interface ConfettiOverlayProps {
    show: boolean;
}

export interface ConfettiParticle {
    left: number;
    delay: number;
    duration: number;
    rotate: number;
    size: number;
    emoji: string;
    key: number;
}

export interface WinResult {
    winner: Player;
    line: number[];
}
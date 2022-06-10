export type MineMatrix = Array<{
  x: number;
  y: number;
}>;

export const enum MatrixMode {
  EASY = 'easy',
  HARD = 'hard',
}

export type MatrixConfig = Record<
  MatrixMode,
  {
    mines: number;
    size: number;
  }
>;

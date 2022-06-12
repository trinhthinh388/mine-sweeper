import { MatrixConfig, MatrixMode } from 'models';

export const MATRIX_CONFIGS: MatrixConfig = {
  [MatrixMode.EASY]: {
    size: 9,
    mines: 10,
  },
  [MatrixMode.HARD]: {
    size: 16,
    mines: 40,
  },
};

export const MATRIX_COLORS: Record<number, number> = {
  1: 0x0000ff,
  2: 0x008000,
  3: 0xff0000,
  4: 0x191989,
  5: 0x800000,
  6: 0x40e0d0,
  7: 0x000000,
  8: 0x808080,
};

export * from './routes';

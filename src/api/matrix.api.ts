import { MineMatrix } from 'models';

// Utils
import { generateSearchParams } from 'utils/helpers';

const ENDPOINT = 'https://tiki-minesweeper.herokuapp.com/getMines';

const MODE = {
  easy: {
    size: '9',
    mines: '10',
  },
  hard: {
    size: '16',
    mines: '40',
  },
};

export const fetchMineMatrix = async (
  mode: 'easy' | 'hard'
): Promise<MineMatrix | null> => {
  const params = generateSearchParams(MODE[mode]);
  const resp = await fetch(`${ENDPOINT}?${params.toString()}`);
  const json = await resp.json();
  if (typeof json === 'object' && json.data) return json.data;
  return null;
};

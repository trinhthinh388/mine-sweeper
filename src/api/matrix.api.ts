import { MatrixMode, MineMatrix } from 'models';
import { MATRIX_CONFIGS } from 'constant';

// Utils
import { generateSearchParams } from 'utils/helpers';

const ENDPOINT = 'https://tiki-minesweeper.herokuapp.com/getMines';

export const fetchMineMatrix = async (
  mode: MatrixMode
): Promise<MineMatrix | null> => {
  const params = generateSearchParams(MATRIX_CONFIGS[mode]);
  const resp = await fetch(`${ENDPOINT}?${params.toString()}`);
  const json = await resp.json();
  if (typeof json === 'object' && json.data) return json.data;
  return null;
};

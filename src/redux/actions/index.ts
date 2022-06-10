import { MineMatrix } from 'src/models';
import { MatrixActions } from '../types';

export type Action<T = '', P = undefined> = {
  type: T;
  payload: P;
};

export type Actions =
  | Action<MatrixActions.FETCHING_MATRIX>
  | Action<MatrixActions.FETCH_MATRIX_SUCCESS, { data: MineMatrix }>
  | Action<MatrixActions.FETCH_MATRIX_FAIL>;

export * from './matrix.action';

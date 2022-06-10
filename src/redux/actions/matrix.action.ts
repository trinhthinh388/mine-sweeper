import { MineMatrix } from 'models';
import { MatrixActions } from '../types';
import { Dispatch } from 'redux';
import { fetchMineMatrix } from 'api';

const requestGetMineMatrix = () => ({
  type: MatrixActions.FETCHING_MATRIX,
});
const getMineMatrixSuccess = (data: MineMatrix) => ({
  type: MatrixActions.FETCH_MATRIX_SUCCESS,
  payload: {
    data,
  },
});
const getMineMatrixFail = () => ({
  type: MatrixActions.FETCH_MATRIX_FAIL,
});
export const getMineMatrix =
  (mode: 'easy' | 'hard', callback = () => {}) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(requestGetMineMatrix());
      const data = await fetchMineMatrix(mode);
      if (data) {
        dispatch(getMineMatrixSuccess(data));
        callback();
      }
    } catch (_) {
      dispatch(getMineMatrixFail());
    }
  };

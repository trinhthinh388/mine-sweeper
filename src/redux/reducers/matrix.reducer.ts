import { MineMatrix } from 'src/models';
import { Actions } from '../actions';
import { MatrixActions } from '../types';

export type MatrixState = {
  currentMatrix: MineMatrix | null;
  loading: boolean;
};

const defaultState: MatrixState = {
  currentMatrix: null,
  loading: false,
};

export default function matrixReducer(
  state: MatrixState = defaultState,
  action: Actions
): MatrixState {
  switch (action?.type) {
    case MatrixActions.FETCHING_MATRIX: {
      return {
        ...state,
        loading: true,
      };
    }
    case MatrixActions.FETCH_MATRIX_SUCCESS: {
      return {
        ...state,
        loading: false,
        currentMatrix: action?.payload.data,
      };
    }
    case MatrixActions.FETCH_MATRIX_FAIL: {
      return {
        ...state,
        loading: false,
      };
    }
    default:
      return defaultState;
  }
}

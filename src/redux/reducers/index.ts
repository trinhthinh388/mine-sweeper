import matrixReducer, { MatrixState } from './matrix.reducer';
import { combineReducers } from 'redux';

export type RootReducer = {
  matrix: MatrixState;
};

export const rootReducer = combineReducers<RootReducer>({
  matrix: matrixReducer,
});

import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { rootReducer } from './reducers';

const middlewares = [thunk];
const enhancers = applyMiddleware(...middlewares);

const store = createStore(rootReducer, enhancers);

export default store;

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { RoutePath } from './constant';

// Styles
import 'styles/global.scss';
import 'styles/font.scss';

// Pages
const Landing = React.lazy(() => import('./pages/Landing'));
const Playground = React.lazy(() => import('./pages/Playground'));

export type AppProps = {
  children?: React.ReactNode;
};

const App: React.FC<AppProps> = () => {
  return (
    <Provider store={store}>
      <React.Suspense>
        <Router>
          <Routes>
            <Route path={RoutePath.HOME} element={<Landing />} />
            <Route path={RoutePath.PLAYGROUND} element={<Playground />} />
          </Routes>
        </Router>
      </React.Suspense>
    </Provider>
  );
};

export default App;

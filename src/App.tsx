import React from 'react';
import 'styles/global.scss';
import 'styles/font.scss';

// Pages
const Landing = React.lazy(() => import('./pages/Landing'));

export type AppProps = {
  children?: React.ReactNode;
};

const App: React.FC<AppProps> = () => {
  return (
    <>
      <Landing />
    </>
  );
};

export default App;

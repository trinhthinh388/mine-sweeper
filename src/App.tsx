import React from 'react';

export type AppProps = {
  children?: React.ReactNode;
};

const App: React.FC<AppProps> = ({ children }) => {
  return (
    <>
      <div>Hello world!!</div>
      {children}
    </>
  );
};

export default App;

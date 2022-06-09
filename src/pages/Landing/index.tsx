import React from 'react';
// Styles
import styles from './styles.module.scss';

// Components
import { Button } from 'components';

const Landing: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [showDifficulty, setShow] = React.useState<boolean>(false);

  const onPlayClick = () => setShow(prev => !prev);

  return (
    <div ref={containerRef} className={styles.container}>
      <h1 className={styles.title}>
        Mine<span>Sweeper</span>
      </h1>

      <div className={styles.action}>
        {!showDifficulty && <Button onClick={onPlayClick}>Play!</Button>}
        {showDifficulty && (
          <>
            <h2>Difficulty</h2>
            <Button>Easy</Button>
            <Button>Hard</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Landing;

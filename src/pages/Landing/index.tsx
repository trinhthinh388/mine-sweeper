import React from 'react';
import { useSpring, animated } from 'react-spring';

// Styles
import styles from './styles.module.scss';

// Components
import { Button } from 'components';

const Landing: React.FC = () => {
  const [showDifficulty, setShow] = React.useState<boolean>(false);

  const animStyles = useSpring({
    opacity: showDifficulty ? 0 : 1,
  });
  const difficultStyles = useSpring({
    opacity: showDifficulty ? 1 : 0,
    transform: showDifficulty ? 'scale(1)' : 'scale(0)',
  });

  const onPlayClick = () => setShow(prev => !prev);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Mine<span>Sweeper</span>
      </h1>

      <div className={styles.action}>
        <animated.div style={animStyles}>
          <Button onClick={onPlayClick}>Play!</Button>
        </animated.div>

        <animated.div style={difficultStyles}>
          <h2 onClick={onPlayClick}>Difficulty</h2>
          <Button>Easy</Button>
          <Button>Hard</Button>
        </animated.div>
      </div>
    </div>
  );
};

export default Landing;

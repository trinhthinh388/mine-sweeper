import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTypedDispatch } from 'redux/helpers';
import { getMineMatrix } from 'redux/actions';
import { MatrixMode } from 'src/models';
// Styles
import styles from './styles.module.scss';

// Components
import { Button } from 'components';

const Landing: React.FC = () => {
  const navigator = useNavigate();
  const dispatch = useTypedDispatch();
  const [isPending, startTransition] = React.useTransition();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [showDifficulty, setShow] = React.useState<boolean>(false);

  const onPlayClick = () => setShow(prev => !prev);

  const toPlayground = (mode: MatrixMode) => () => {
    navigator(`/playground?mode=${mode}`);
  };

  const onModeClick = (mode: MatrixMode) => () => {
    startTransition(() => {
      dispatch(getMineMatrix(mode, toPlayground(mode)));
    });
  };

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
            <Button onClick={onModeClick(MatrixMode.EASY)}>Easy</Button>
            <Button onClick={onModeClick(MatrixMode.HARD)}>Hard</Button>
          </>
        )}
        {isPending && <h1>THINHMEO</h1>}
      </div>
    </div>
  );
};

export default Landing;

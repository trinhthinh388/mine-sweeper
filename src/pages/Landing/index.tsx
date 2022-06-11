import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTypedDispatch, useTypedSelector } from 'redux/helpers';
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
  const isLoading = useTypedSelector(state => state.matrix.loading);
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
      <h1 className={styles.title}>MineSweeper</h1>

      <div className={styles.action}>
        {!isLoading && !isPending && !showDifficulty && (
          <Button disabled={isLoading || isPending} onClick={onPlayClick}>
            Play!
          </Button>
        )}
        {!isLoading && !isPending && showDifficulty && (
          <>
            <h2>Difficulty</h2>
            <Button
              disabled={isLoading || isPending}
              onClick={onModeClick(MatrixMode.EASY)}
            >
              Easy
            </Button>
            <Button
              disabled={isLoading || isPending}
              onClick={onModeClick(MatrixMode.HARD)}
            >
              Hard
            </Button>
          </>
        )}
        {(isLoading || isPending) && (
          <h1 className={styles.loadingText}>Loading...</h1>
        )}
      </div>
    </div>
  );
};

export default Landing;

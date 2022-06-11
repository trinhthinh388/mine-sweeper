import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MatrixMode } from 'models';
import { MATRIX_CONFIGS, RoutePath } from 'constant';
import { useTypedDispatch, useTypedSelector } from 'redux/helpers';
import { getMineMatrix } from 'redux/actions';
import { mergeClassname } from 'utils/helpers';

// Styles
import styles from './styles.module.scss';

// Components
import { Button, MatrixGrid, Modal } from 'components';

type FaceState = 'smile' | 'cry';

const Playground: React.FC = () => {
  const dispatch = useTypedDispatch();
  const navigateTo = useNavigate();
  const { search } = useLocation();
  const mode = new URLSearchParams(search).get('mode') || MatrixMode.EASY;
  const matrix = useTypedSelector(state => state.matrix.currentMatrix);
  const isLoading = useTypedSelector(state => state.matrix.loading);
  const intervalId = React.useRef<number>(0);
  const [gameState, setGameState] = React.useState<{
    spendTime: number;
    face: FaceState;
    remainBombs: number;
    status?: 'win' | 'lose';
  }>({
    spendTime: 0,
    face: 'smile',
    remainBombs:
      mode === MatrixMode.EASY
        ? MATRIX_CONFIGS[mode].mines
        : MATRIX_CONFIGS[MatrixMode.HARD].mines,
  });

  const onLose = React.useCallback(() => {
    setGameState(prev => ({
      ...prev,
      face: 'cry',
      status: 'lose',
    }));
    clearInterval(intervalId.current);
  }, []);

  const onFlag = React.useCallback(
    (type: 'unflag' | 'flag') => {
      const remainBombs = gameState.remainBombs;
      if (type === 'flag') {
        if (remainBombs <= 0) return;
        setGameState(prev => ({ ...prev, remainBombs: prev.remainBombs - 1 }));
      } else if (type === 'unflag') {
        setGameState(prev => ({ ...prev, remainBombs: prev.remainBombs + 1 }));
      }
    },
    [gameState.remainBombs]
  );

  const onWin = React.useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: 'win',
    }));
    clearInterval(intervalId.current);
  }, []);

  const tick = () => {
    intervalId.current = window.setInterval(() => {
      setGameState(prev => ({
        ...prev,
        spendTime: prev.spendTime + 1,
      }));
    }, 1000);
  };

  const reset = () => {
    setGameState(prev => ({
      ...prev,
      face: 'smile',
      spendTime: 0,
      status: undefined,
      remainBombs:
        mode === MatrixMode.EASY
          ? MATRIX_CONFIGS[mode].mines
          : MATRIX_CONFIGS[MatrixMode.HARD].mines,
    }));
    clearInterval(intervalId.current);
    dispatch(
      getMineMatrix(
        mode === MatrixMode.EASY ? MatrixMode.EASY : MatrixMode.HARD
      )
    );
  };

  const parseTime = (secs: number) => {
    const minutes = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (secs % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const toHomePage = () => {
    navigateTo(RoutePath.HOME);
  };

  React.useEffect(() => {
    if (matrix) return;
    dispatch(
      getMineMatrix(
        mode === MatrixMode.EASY ? MatrixMode.EASY : MatrixMode.HARD
      )
    );
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.taskbar}>
        <div className={styles.stats}>
          <div className={styles.icon}>
            <img alt="bomb" width={128} height={128} src="/png/bomb.png" />
          </div>
          <span className={styles.value}>
            {gameState.remainBombs.toString().padStart(3, '0')}
          </span>
        </div>

        <div className={styles.face} onClick={reset}>
          <img
            alt="face"
            width={62}
            height={62}
            src={`/png/${gameState.face}.png`}
          />
        </div>

        <div className={styles.stats}>
          <div className={styles.icon}>
            <img alt="clock" width={128} height={128} src="/png/clock.png" />
          </div>
          <span className={styles.value}>{parseTime(gameState.spendTime)}</span>
        </div>
      </div>

      {isLoading && (
        <h1 className={styles.result}>
          Please wait!
          <span>We&apos;re placing mines.</span>
        </h1>
      )}

      {!isLoading && (
        <div className={styles.gridContainer}>
          <MatrixGrid
            mode={mode === 'easy' ? MatrixMode.EASY : MatrixMode.HARD}
            matrixData={matrix}
            onLose={onLose}
            onFlag={onFlag}
            onWin={onWin}
            onFirstClick={tick}
          />
        </div>
      )}
      <Modal show={!!gameState.status}>
        {gameState.status === 'lose' && (
          <h1 className={mergeClassname(styles.result, styles.lose)}>
            Lose! <span>Uh oh! You clicked a bomb.</span>
          </h1>
        )}
        {gameState.status === 'win' && (
          <h1 className={mergeClassname(styles.result, styles.win)}>
            Win!
            <span>
              You have unfolded all valid tiles in{' '}
              {parseTime(gameState.spendTime)}.
            </span>
          </h1>
        )}
        <div className={styles.action}>
          <Button onClick={reset}>New game</Button>
          <Button onClick={toHomePage}>Back to Home</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Playground;

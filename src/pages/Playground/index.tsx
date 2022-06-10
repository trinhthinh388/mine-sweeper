import React, { useState } from 'react';
import { mergeClassname } from 'utils/helpers';

// Styles
import styles from './styles.module.scss';

// Components
import { MatrixGrid } from 'components';
import { useLocation } from 'react-router-dom';
import { MatrixMode } from 'models';

type FaceState = 'smile' | 'cry';

const Playground: React.FC = () => {
  const { search } = useLocation();
  const mode = new URLSearchParams(search).get('mode');
  const [face, setFace] = useState<FaceState>('smile');

  const onLose = React.useCallback(() => {
    setFace('cry');
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.taskbar}>
        <div className={styles.stats}>
          <div className={styles.icon}>
            <img alt="bomb" width={128} height={128} src="/png/bomb.png" />
          </div>
          <span className={styles.value}>010</span>
        </div>

        <div className={styles.face}>
          <img alt="face" width={62} height={62} src={`/png/${face}.png`} />
        </div>

        <div className={styles.stats}>
          <div className={styles.icon}>
            <img alt="clock" width={128} height={128} src="/png/clock.png" />
          </div>
          <span className={styles.value}>00:00</span>
        </div>
      </div>

      <div
        className={mergeClassname(
          styles.gridContainer,
          mode === 'hard' && styles.hardGrid
        )}
      >
        <MatrixGrid
          mode={mode === 'easy' ? MatrixMode.EASY : MatrixMode.HARD}
          onLose={onLose}
        />
      </div>
    </div>
  );
};

export default Playground;

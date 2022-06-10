import React from 'react';
import { MatrixMode } from 'models';
import { ExplodeHandler, MatrixRenderer } from './MatrixRenderer';
import { useTypedSelector } from 'redux/helpers';

// Styles
import styles from './styles.module.scss';

export type MatrixGridProps = {
  mode: MatrixMode;
  onLose?: ExplodeHandler;
};

const data = [
  { x: 8, y: 0 },
  { x: 6, y: 0 },
  { x: 1, y: 5 },
  { x: 4, y: 5 },
  { x: 2, y: 0 },
  { x: 6, y: 1 },
  { x: 1, y: 0 },
  { x: 1, y: 7 },
  { x: 7, y: 4 },
  { x: 1, y: 4 },
];

const MatrixGrid: React.FC<MatrixGridProps> = ({ mode, onLose = () => {} }) => {
  const renderer = React.useRef<MatrixRenderer | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const mineMatrix = useTypedSelector(
    state => state.matrix.currentMatrix || data
  );

  React.useLayoutEffect(() => {
    if (!containerRef.current || !mineMatrix) return;
    renderer.current = new MatrixRenderer(
      mode,
      containerRef.current,
      mineMatrix
    );
    const container = containerRef.current;
    renderer.current.render();
    renderer.current.onExplode(() => {
      container.style.pointerEvents = 'none';
    });
    renderer.current.onExplode(onLose);
  }, [mineMatrix, mode, onLose]);

  return <div ref={containerRef} className={styles.container} />;
};

export default MatrixGrid;

import React from 'react';
import { MatrixMode, MineMatrix } from 'models';
import { EventHandler, MatrixRenderer } from './MatrixRenderer';

// Styles
import styles from './styles.module.scss';

export type MatrixGridProps = {
  mode: MatrixMode;
  matrixData: MineMatrix | null;
  onLose?: EventHandler;
  onWin?: EventHandler;
  onFlag?: EventHandler<'flag' | 'unflag'>;
  onFirstClick?: EventHandler;
};

const MatrixGrid: React.FC<MatrixGridProps> = ({
  mode,
  matrixData,
  onLose = () => {},
  onFlag = () => {},
  onWin = () => {},
  onFirstClick = () => {},
}) => {
  const renderer = React.useRef<MatrixRenderer | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!containerRef.current || !matrixData) return () => {};
    renderer.current = new MatrixRenderer(
      mode,
      containerRef.current,
      matrixData
    );
    renderer.current.render();
    return renderer.current.destroy;
  }, [matrixData, mode]);

  React.useEffect(() => {
    if (!containerRef.current || !renderer.current || !matrixData)
      return () => {};
    const container = containerRef.current;
    const matrix = renderer.current;
    renderer.current;
    renderer.current;
    renderer.current;
    // On Lose
    matrix.on('bombclick', () => {
      container.style.pointerEvents = 'none';
    });
    matrix.on('bombclick', onLose);

    // On Flagged
    matrix.on('flag', onFlag);

    // On Win
    matrix.on('win', onWin);

    // On First Click
    matrix.on('firstclick', onFirstClick);

    return () => {
      matrix.off('bombclick', onLose);
      matrix.off('flag', onFlag);
      matrix.off('win', onWin);
      matrix.off('firstclick', onFirstClick);
      container.style.pointerEvents = 'unset';
    };
  }, [onFlag, onLose, onWin, matrixData, onFirstClick]);

  return <div ref={containerRef} className={styles.container} />;
};

export default MatrixGrid;

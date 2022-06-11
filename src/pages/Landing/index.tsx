import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTypedDispatch, useTypedSelector } from 'redux/helpers';
import { getMineMatrix } from 'redux/actions';
import { MatrixMode } from 'src/models';
import { filters, Graphics, Rectangle, SCALE_MODES, Sprite } from 'pixi.js';
import { MatrixRenderer } from 'components/MatrixGrid/MatrixRenderer';

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

  React.useLayoutEffect(() => {
    if (!containerRef.current) return;
    function pointerMove(event: any) {
      focus.position.x = event.data.global.x - focus.width / 2;
      focus.position.y = event.data.global.y - focus.height / 2;
    }
    const renderer = new MatrixRenderer(MatrixMode.HARD, containerRef.current, [
      { x: 15, y: 8 },
      { x: 12, y: 1 },
      { x: 15, y: 6 },
      { x: 10, y: 0 },
      { x: 0, y: 0 },
      { x: 12, y: 9 },
      { x: 2, y: 12 },
      { x: 3, y: 0 },
      { x: 2, y: 13 },
      { x: 0, y: 15 },
      { x: 10, y: 7 },
      { x: 5, y: 4 },
      { x: 8, y: 5 },
      { x: 14, y: 12 },
      { x: 10, y: 15 },
      { x: 14, y: 5 },
      { x: 4, y: 15 },
      { x: 11, y: 9 },
      { x: 3, y: 15 },
      { x: 9, y: 8 },
      { x: 12, y: 10 },
      { x: 1, y: 14 },
      { x: 3, y: 8 },
      { x: 7, y: 0 },
      { x: 13, y: 7 },
      { x: 0, y: 12 },
      { x: 11, y: 3 },
      { x: 7, y: 1 },
      { x: 3, y: 11 },
      { x: 14, y: 13 },
      { x: 1, y: 6 },
      { x: 12, y: 11 },
      { x: 14, y: 15 },
      { x: 3, y: 6 },
      { x: 7, y: 8 },
      { x: 13, y: 0 },
      { x: 15, y: 12 },
      { x: 7, y: 12 },
      { x: 5, y: 14 },
      { x: 11, y: 12 },
    ]);
    const radius = 100;
    const blurSize = 32;
    const circle = new Graphics()
      .beginFill(0xff0000)
      .drawCircle(radius + blurSize, radius + blurSize, radius)
      .endFill();
    circle.filters = [new filters.BlurFilter(blurSize)];

    const bounds = new Rectangle(
      0,
      0,
      (radius + blurSize) * 2,
      (radius + blurSize) * 2
    );
    const texture = renderer.app.renderer.generateTexture(
      circle,
      SCALE_MODES.NEAREST,
      1,
      bounds
    );
    const focus = new Sprite(texture);

    renderer.app.stage.addChild(focus);
    renderer.app.stage.mask = focus;
    renderer.app.stage.interactive = true;
    renderer.app.stage.on('mousemove', pointerMove);

    renderer.render(true);
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.card}>
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
    </div>
  );
};

export default Landing;

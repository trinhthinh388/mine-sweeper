/* eslint-disable max-statements */
/* eslint-disable complexity */
import {
  Application,
  Container,
  Sprite,
  TextStyle,
  Texture,
  Text,
} from 'pixi.js';
import { MATRIX_COLORS, MATRIX_CONFIGS } from 'constant';
import { MatrixMode, MineMatrix } from 'models';

const BACKGROUND_COLOR = 0x000000;
const GUTTER = 1;
const TEXT_OFFSET = 6;

export type EventHandler<P = [undefined?], T = void> = (...args: P[]) => T;
export type MatrixEvent = 'bombclick' | 'win' | 'flag' | 'firstclick';

export class MatrixRenderer {
  private app: Application;

  /**
   * Containers
   */
  private mineContainer: Container;
  private tileContainer: Container;

  /**
   * Textures
   */
  private tileTexture: Texture;
  private hoverTileTexture: Texture;
  private selectedTileTexture: Texture;
  private bombTexture: Texture;
  private flagTexture: Texture;

  /**
   * Configs
   */
  private configs: { mines: number; size: number };
  private remainBombs: number;
  private remainValidTile: number;
  private mineMatrix: MineMatrix;
  private containerSize: number;
  private containerRef: Element;
  private tileSprites: Array<Array<Sprite>> = [];
  private mineSprites: Array<Array<Sprite | number>> = [];
  private textSprites: Array<Array<Text | null>> = [];

  // Handlers
  private explodeHandlers: Array<EventHandler> = [];
  private flagHandlers: Array<EventHandler<'flag' | 'unflag'>> = [];
  private winHandlers: Array<EventHandler> = [];
  private firstClickHandlers: Array<EventHandler> = [];

  constructor(mode: MatrixMode, containerEl: Element, _mineMatrix: MineMatrix) {
    const { width, height } = containerEl.getBoundingClientRect();
    this.containerSize = width;
    this.containerRef = containerEl;
    this.configs = MATRIX_CONFIGS[mode];

    // Application
    this.app = new Application({
      width,
      height,
      resolution: window.devicePixelRatio || 1,
      backgroundColor: BACKGROUND_COLOR,
    });

    // Textures
    this.tileTexture = Texture.from('/png/tile.png');
    this.hoverTileTexture = Texture.from('/png/tile-hover.png');
    this.selectedTileTexture = Texture.from('/png/tile-selected.png');
    this.bombTexture = Texture.from('/png/bomb.png');
    this.flagTexture = Texture.from('/png/flag.png');

    // Containers
    this.tileContainer = new Container();
    this.mineContainer = new Container();

    // Configs
    this.mineMatrix = _mineMatrix;
    this.remainBombs = this.configs.mines;
    this.remainValidTile =
      this.configs.size * this.configs.size - this.configs.mines;
    for (let i = 0; i < this.configs.size; i++) {
      const row: Array<number> = [];
      const rowTextSprite: Array<null> = [];
      for (let j = 0; j < this.configs.size; j++) {
        row.push(0);
        rowTextSprite.push(null);
      }
      this.mineSprites.push(row);
      this.textSprites.push(rowTextSprite);
    }

    this.app.view.oncontextmenu = e => e.preventDefault();
    containerEl.appendChild(this.app.view);
    this.app.stage.addChild(this.tileContainer);
    this.app.stage.addChild(this.mineContainer);

    // Binding
    this.renderTile = this.renderTile.bind(this);
    this.calculateNearbyBombs = this.calculateNearbyBombs.bind(this);
    this.increaseTileWeight = this.increaseTileWeight.bind(this);
    this.calculateNearbyBombs = this.calculateNearbyBombs.bind(this);
    this.unfoldValidTile = this.unfoldValidTile.bind(this);
    this.isBomb = this.isBomb.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  private unfoldValidTile(x: number, y: number) {
    const len = this.mineSprites.length;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (this.tileSprites[x][y].flagged) return;
    if (typeof this.mineSprites[x][y] !== 'number') return;
    if (
      typeof this.mineSprites[x][y] === 'number' &&
      this.mineSprites[x][y] > 0
    ) {
      this.mineSprites[x][y] = -1;
      this.remainValidTile--;
      this.tileSprites[x][y].interactive = false;
      this.tileSprites[x][y].texture = this.selectedTileTexture;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (this.textSprites[x][y].bombs > 0) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.textSprites[x][y].style.fill =
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          MATRIX_COLORS[this.textSprites[x][y].bombs];
      }
      return;
    }

    this.mineSprites[x][y] = -1;
    this.remainValidTile--;
    this.tileSprites[x][y].interactive = false;
    this.tileSprites[x][y].texture = this.selectedTileTexture;

    // // Top
    if (x - 1 >= 0 && this.mineSprites[x - 1][y] !== -1)
      this.unfoldValidTile(x - 1, y);
    // Right
    if (y + 1 < len && this.mineSprites[x][y + 1] !== -1)
      this.unfoldValidTile(x, y + 1);
    // Bottom
    if (x + 1 < len && this.mineSprites[x + 1][y] !== -1)
      this.unfoldValidTile(x + 1, y);
    // Left
    if (y - 1 >= 0 && this.mineSprites[x][y - 1] !== -1)
      this.unfoldValidTile(x, y - 1);
    // Top Left
    if (y - 1 >= 0 && x - 1 >= 0 && this.mineSprites[x - 1][y - 1] !== -1)
      this.unfoldValidTile(x - 1, y - 1);
    // Top Right
    if (y + 1 < len && x - 1 >= 0 && this.mineSprites[x - 1][y + 1] !== -1)
      this.unfoldValidTile(x - 1, y + 1);
    // Bottom Left
    if (y - 1 >= 0 && x + 1 < len && this.mineSprites[x + 1][y - 1] !== -1)
      this.unfoldValidTile(x + 1, y - 1);
    // Bottom Right
    if (y + 1 < len && x + 1 < len && this.mineSprites[x + 1][y + 1] !== -1)
      this.unfoldValidTile(x + 1, y + 1);
  }

  private increaseTileWeight(x: number, y: number) {
    const increase = (dx: number, dy: number) => {
      if (typeof this.mineSprites[dx][dy] === 'number') {
        (this.mineSprites[dx][dy] as number)++;
      }
    };
    // Top
    if (x - 1 >= 0) increase(x - 1, y);
    // Bottom
    if (x + 1 < this.configs.size) increase(x + 1, y);
    // Right
    if (y + 1 < this.configs.size) increase(x, y + 1);
    // Left
    if (y - 1 >= 0) increase(x, y - 1);
    // Top Left
    if (y - 1 >= 0 && x - 1 >= 0) increase(x - 1, y - 1);
    // Top Right
    if (y + 1 < this.configs.size && x - 1 >= 0) increase(x - 1, y + 1);
    // Bottom Left
    if (y - 1 >= 0 && x + 1 < this.configs.size) increase(x + 1, y - 1);
    // Bottom Right
    if (y + 1 < this.configs.size && x + 1 < this.configs.size)
      increase(x + 1, y + 1);
  }

  private calculateNearbyBombs() {
    /**
     * The idea is we will loop through every mine position and
     * then add 1 to every surrounding tile's weight. Every tile on both
     * diagonal lines and straight lines.
     */
    this.mineMatrix.forEach(minePos => {
      const { x, y } = minePos;
      this.increaseTileWeight(x, y);
    });
  }

  private renderTile() {
    const onBombClick = () => {
      this.explodeHandlers.forEach(handler => {
        handler();
        this.mineMatrix.forEach(minePos => {
          const { x, y } = minePos;
          if (typeof this.mineSprites[x][y] !== 'number') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            this.mineSprites[x][y].texture = this.bombTexture;
          }
        });
      });
    };
    const onSpriteHover = (sprite: Sprite) => () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (sprite.flagged) return;
      sprite.texture = this.hoverTileTexture;
    };
    const onSpriteOut = (sprite: Sprite) => () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (sprite.flagged) return;
      sprite.texture = this.tileTexture;
    };

    const onSpriteLeftClick = (sprite: Sprite, x: number, y: number) => () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (sprite.flagged) return;
      if (
        this.remainValidTile ===
        this.configs.size * this.configs.size - this.configs.mines
      ) {
        this.firstClickHandlers.forEach(handler => {
          handler();
        });
      }
      if (this.isBomb(x, y)) {
        onBombClick();
      }
      sprite.interactive = false;
      sprite.texture = this.selectedTileTexture;
      this.unfoldValidTile(x, y);
      if (this.remainValidTile <= 0) {
        this.winHandlers.forEach(handler => {
          handler();
        });
      }
    };
    const onSpriteRightClick = (sprite: Sprite) => () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (!sprite.flagged && this.remainBombs > 0) {
        this.flagHandlers.forEach(handler => {
          handler('flag');
        });
        sprite.texture = this.flagTexture;
        this.remainBombs--;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        sprite.flagged = true;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
      } else if (sprite.flagged) {
        this.flagHandlers.forEach(handler => {
          handler('unflag');
        });
        sprite.texture = this.tileTexture;
        this.remainBombs++;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        sprite.flagged = false;
      }
    };

    const { size } = this.configs;
    const cellSize = this.containerSize / size;
    for (let i = 0; i < size; i++) {
      const row: Array<Sprite> = [];
      for (let j = 0; j < size; j++) {
        const sprite = new Sprite(this.tileTexture);
        sprite.x = j * cellSize + GUTTER;
        sprite.y = i * cellSize + GUTTER;
        sprite.width = cellSize - GUTTER;
        sprite.height = cellSize - GUTTER;
        sprite.interactive = true;
        // Events
        sprite.on('pointerover', onSpriteHover(sprite));
        sprite.on('pointerout', onSpriteOut(sprite));
        sprite.on('click', onSpriteLeftClick(sprite, i, j));
        sprite.on('rightclick', onSpriteRightClick(sprite));
        row.push(sprite);
      }
      this.tileSprites.push(row);
    }
  }

  private renderMines() {
    const { size } = this.configs;
    const cellSize = this.containerSize / size;
    this.mineMatrix.forEach(minePos => {
      const { x, y } = minePos;
      const mineSprite = new Sprite();
      mineSprite.x = y * cellSize + GUTTER;
      mineSprite.y = x * cellSize + GUTTER;
      mineSprite.width = cellSize - GUTTER;
      mineSprite.height = cellSize - GUTTER;
      this.mineSprites[x][y] = mineSprite;
    });
  }

  private isBomb(x: number, y: number) {
    return typeof this.mineSprites[x][y] !== 'number';
  }

  public on(eventType: MatrixEvent, handler: EventHandler<any, any>) {
    switch (eventType) {
      case 'bombclick':
        this.explodeHandlers.push(handler);
        break;
      case 'flag':
        this.flagHandlers.push(handler);
        break;
      case 'win':
        this.winHandlers.push(handler);
        break;
      case 'firstclick':
        this.firstClickHandlers.push(handler);
        break;
    }
  }

  public off(eventType: MatrixEvent, handler: EventHandler<any, any>) {
    switch (eventType) {
      case 'bombclick':
        this.explodeHandlers = this.explodeHandlers.filter(h => h !== handler);
        break;
      case 'flag':
        this.flagHandlers = this.flagHandlers.filter(h => h !== handler);
        break;
      case 'firstclick':
        this.firstClickHandlers = this.firstClickHandlers.filter(
          h => h !== handler
        );
        break;
      case 'win':
        this.winHandlers = this.winHandlers.filter(h => h !== handler);
        break;
    }
  }

  public render() {
    const cellSize = this.containerSize / this.configs.size;
    this.renderTile();
    this.renderMines();
    this.calculateNearbyBombs();
    this.tileSprites.forEach(row => {
      row.forEach(tile => {
        this.tileContainer.addChild(tile);
      });
    });
    this.mineSprites.forEach((row, i) => {
      row.forEach((mine, j) => {
        if (typeof mine === 'number' && mine > 0) {
          const textSprite = new Text(
            mine.toString(),
            new TextStyle({
              fontFamily: 'Pixel',
              fontSize: cellSize / 2,
              align: 'center',
              fill: 0xffffff00,
            })
          );
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          textSprite.bombs = mine;

          textSprite.position.x =
            j * cellSize + GUTTER + cellSize / 2 - cellSize / 4 + TEXT_OFFSET;
          textSprite.position.y =
            i * cellSize + GUTTER + cellSize / 2 - cellSize / 4;
          this.mineContainer.addChild(textSprite);
          this.textSprites[i][j] = textSprite;
        } else if (typeof mine !== 'number') {
          this.mineContainer.addChild(mine);
        }
      });
    });
  }

  public destroy() {
    this.containerRef.innerHTML = '';
    this.app.stage.destroy();
    this.app.destroy();
  }
}

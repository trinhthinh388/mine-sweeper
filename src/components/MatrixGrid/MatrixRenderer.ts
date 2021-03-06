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
import { isSprite } from 'utils/helpers';

const BACKGROUND_COLOR = 0x000000;
const GUTTER = 1;

export type EventHandler<P = [undefined?], T = void> = (...args: P[]) => T;
export type MatrixEvent = 'bombclick' | 'win' | 'flag' | 'firstclick';

export class MatrixRenderer {
  public app: Application;

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
  private textSprites: Array<Array<Text>> = [];

  // Handlers
  private explodeHandlers: Array<EventHandler> = [];
  private flagHandlers: Array<EventHandler<'flag' | 'unflag'>> = [];
  private winHandlers: Array<EventHandler> = [];
  private firstClickHandlers: Array<EventHandler> = [];

  constructor(
    mode: MatrixMode,
    containerEl: HTMLElement,
    _mineMatrix: MineMatrix
  ) {
    const { width } = containerEl.getBoundingClientRect();
    this.containerSize = width;
    this.containerRef = containerEl;
    this.configs = MATRIX_CONFIGS[mode];

    // Application
    this.app = new Application({
      width: this.containerSize,
      height: this.containerSize,
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
      const rowTextSprite: Array<Text> = [];
      for (let j = 0; j < this.configs.size; j++) {
        row.push(0);
        rowTextSprite.push(new Text());
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
    this.calculateNearbyBombs = this.calculateNearbyBombs.bind(this);
    this.unfoldValidTile = this.unfoldValidTile.bind(this);
    this.isBomb = this.isBomb.bind(this);
    this.destroy = this.destroy.bind(this);
    this.takeScreenshot = this.takeScreenshot.bind(this);
  }

  private unfoldValidTile(x: number, y: number) {
    const callback = (dx: number, dy: number): boolean => {
      if (this.tileSprites[dx][dy].flagged) return false;
      if (typeof this.mineSprites[dx][dy] !== 'number') return false;
      if (
        typeof this.mineSprites[dx][dy] === 'number' &&
        this.mineSprites[dx][dy] > 0
      ) {
        this.mineSprites[dx][dy] = -1;
        this.remainValidTile--;
        this.tileSprites[dx][dy].interactive = false;
        this.tileSprites[dx][dy].texture = this.selectedTileTexture;
        if (this.textSprites[dx][dy].bombs > 0) {
          this.textSprites[dx][dy].style.fill =
            MATRIX_COLORS[this.textSprites[dx][dy].bombs];
        }
        return false;
      }

      this.mineSprites[dx][dy] = -1;
      this.remainValidTile--;
      this.tileSprites[dx][dy].interactive = false;
      this.tileSprites[dx][dy].texture = this.selectedTileTexture;
      return true;
    };
    searchNearbyBomb(this.mineSprites, x, y, callback);
  }

  private calculateNearbyBombs() {
    /**
     * The idea is we will loop through every mine position and
     * then add 1 to every surrounding tile's weight. Every tile on both
     * diagonal lines and straight lines.
     */
    this.mineMatrix.forEach(minePos => {
      const { x, y } = minePos;
      increaseTileWeight(x, y, this.configs.size, (dx: number, dy: number) => {
        if (typeof this.mineSprites[dx][dy] === 'number') {
          (this.mineSprites[dx][dy] as number)++;
        }
      });
    });
  }

  private renderTile() {
    const onBombClick = () => {
      this.explodeHandlers.forEach(handler => {
        handler();
        this.mineMatrix.forEach(minePos => {
          const { x, y } = minePos;
          if (typeof this.mineSprites[x][y] !== 'number') {
            (this.mineSprites[x][y] as Sprite).texture = this.bombTexture;
          }
        });
      });
    };
    const onSpriteHover = (sprite: Sprite) => () => {
      if (sprite.flagged) return;
      sprite.texture = this.hoverTileTexture;
    };
    const onSpriteOut = (sprite: Sprite) => () => {
      if (sprite.flagged) return;
      sprite.texture = this.tileTexture;
    };

    const onSpriteLeftClick = (sprite: Sprite, x: number, y: number) => () => {
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
      if (!sprite.flagged && this.remainBombs > 0) {
        this.flagHandlers.forEach(handler => {
          handler('flag');
        });
        sprite.texture = this.flagTexture;
        this.remainBombs--;
        sprite.flagged = true;
      } else if (sprite.flagged) {
        this.flagHandlers.forEach(handler => {
          handler('unflag');
        });
        sprite.texture = this.tileTexture;
        this.remainBombs++;
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
        sprite.on('touchend', onSpriteLeftClick(sprite, i, j));
        sprite.on('rightclick', onSpriteRightClick(sprite));
        row.push(sprite);
      }
      this.tileSprites.push(row);
    }
  }

  private renderMines(reveal = false) {
    const { size } = this.configs;
    const cellSize = this.containerSize / size;
    this.mineMatrix.forEach(minePos => {
      const { x, y } = minePos;
      const mineSprite = new Sprite(reveal ? this.bombTexture : undefined);
      mineSprite.x = y * cellSize + GUTTER;
      mineSprite.y = x * cellSize + GUTTER;
      mineSprite.width = cellSize - GUTTER;
      mineSprite.height = cellSize - GUTTER;
      this.mineSprites[x][y] = mineSprite;
    });
  }

  private isBomb(x: number, y: number) {
    return isSprite(this.mineSprites[x][y]);
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

  public render(reveal = false) {
    const cellSize = this.containerSize / this.configs.size;
    this.renderTile();
    this.renderMines(reveal);
    this.calculateNearbyBombs();
    this.tileSprites.forEach(row => {
      row.forEach(tile => {
        if (reveal) {
          tile.texture = this.selectedTileTexture;
        }
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
              fill: reveal ? MATRIX_COLORS[mine] : 0xffffff00,
            })
          );
          textSprite.bombs = mine;

          textSprite.position.x =
            j * cellSize + GUTTER + cellSize / 2 - cellSize / 4 + cellSize / 8;
          textSprite.position.y =
            i * cellSize + GUTTER + cellSize / 2 - cellSize / 4;
          this.mineContainer.addChild(textSprite);
          this.textSprites[i][j] = textSprite;
        } else if (isSprite(mine)) {
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

  public takeScreenshot(imageContainer: HTMLElement = window.document.body) {
    setTimeout(() => {
      const image = this.app.renderer.plugins.extract.image(this.app.stage);
      if (image.length) {
        imageContainer.appendChild(image.pop());
        return;
      }
      imageContainer.appendChild(image);
    }, 100);
  }
}

/**
 * increaseTileWeight will find the proper tile then execute the callback with the founded tile's position.
 * @param x the x position of the bomb
 * @param y the y position of the bomb
 * @param len the length of the grid
 * @param callback the function to perform any action when found proper tile.
 */
export function increaseTileWeight(
  x: number,
  y: number,
  len: number,
  callback: (dx: number, dy: number) => any
) {
  const increase = (dx: number, dy: number) => {
    callback(dx, dy);
  };
  // Top
  if (x - 1 >= 0) increase(x - 1, y);
  // Bottom
  if (x + 1 < len) increase(x + 1, y);
  // Right
  if (y + 1 < len) increase(x, y + 1);
  // Left
  if (y - 1 >= 0) increase(x, y - 1);
  // Top Left
  if (y - 1 >= 0 && x - 1 >= 0) increase(x - 1, y - 1);
  // Top Right
  if (y + 1 < len && x - 1 >= 0) increase(x - 1, y + 1);
  // Bottom Left
  if (y - 1 >= 0 && x + 1 < len) increase(x + 1, y - 1);
  // Bottom Right
  if (y + 1 < len && x + 1 < len) increase(x + 1, y + 1);
}

/**
 * searchNearbyBomb will search every valid tiles and only return if the callback returns false.
 * Muse mark input tiles as visited inside callback.
 * @param arr
 * @param x
 * @param y
 * @param callback
 * @returns
 */
export function searchNearbyBomb(
  arr: Array<Array<any>>,
  x: number,
  y: number,
  callback: (dx: number, dy: number) => boolean
) {
  const len = arr.length;
  if (!callback(x, y)) return;
  // // Top
  if (x - 1 >= 0 && arr[x - 1][y] !== -1)
    searchNearbyBomb(arr, x - 1, y, callback);
  // Right
  if (y + 1 < len && arr[x][y + 1] !== -1)
    searchNearbyBomb(arr, x, y + 1, callback);
  // Bottom
  if (x + 1 < len && arr[x + 1][y] !== -1)
    searchNearbyBomb(arr, x + 1, y, callback);
  // Left
  if (y - 1 >= 0 && arr[x][y - 1] !== -1)
    searchNearbyBomb(arr, x, y - 1, callback);
  // Top Left
  if (y - 1 >= 0 && x - 1 >= 0 && arr[x - 1][y - 1] !== -1)
    searchNearbyBomb(arr, x - 1, y - 1, callback);
  // Top Right
  if (y + 1 < len && x - 1 >= 0 && arr[x - 1][y + 1] !== -1)
    searchNearbyBomb(arr, x - 1, y + 1, callback);
  // Bottom Left
  if (y - 1 >= 0 && x + 1 < len && arr[x + 1][y - 1] !== -1)
    searchNearbyBomb(arr, x + 1, y - 1, callback);
  // Bottom Right
  if (y + 1 < len && x + 1 < len && arr[x + 1][y + 1] !== -1)
    searchNearbyBomb(arr, x + 1, y + 1, callback);
}

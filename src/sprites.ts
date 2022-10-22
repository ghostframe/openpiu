import { Canvas } from './canvas';

export type Sprite = {
  xChunks: number;
  yChunks: number;
  image: HTMLImageElement;
};

export class Sprites {
  static board: Sprite;
  static note1: Sprite;
  static note1Tail: Sprite;
  static note1TailEnd: Sprite;
  static note2: Sprite;
  static note2Tail: Sprite;
  static note2TailEnd: Sprite;
  static note3: Sprite;
  static note3Tail: Sprite;
  static note3TailEnd: Sprite;
  static note4: Sprite;
  static note4Tail: Sprite;
  static note4TailEnd: Sprite;
  static note5: Sprite;
  static note5Tail: Sprite;
  static note5TailEnd: Sprite;
  static noteJudgements: Sprite;
  static noteExplosion: Sprite;
  static comboNumbers: Sprite;

  static async load(): Promise<void> {
    this.board = await this.loadSprite('BASE 1x2');

    this.note1 = await this.loadSprite('DownLeft Tap Note 6x1');
    this.note1Tail = await this.loadSprite('DownLeft Hold Body Active 6x1');
    this.note1TailEnd = await this.loadSprite(
      'DownLeft Hold BottomCap Active 6x1'
    );

    this.note2 = await this.loadSprite('UpLeft Tap Note 6x1');
    this.note2Tail = await this.loadSprite('UpLeft Hold Body Active 6x1');
    this.note2TailEnd = await this.loadSprite(
      'UpLeft Hold BottomCap Active 6x1'
    );

    this.note3 = await this.loadSprite('Center Tap Note 6x1');
    this.note3Tail = await this.loadSprite('Center Hold Body Active 6x1');
    this.note3TailEnd = await this.loadSprite(
      'Center Hold BottomCap Active 6x1'
    );

    this.note4 = await this.loadSprite('UpLeft Tap Note 6x1');
    this.note4Tail = await this.loadSprite('UpRight Hold Body Active 6x1');
    this.note4TailEnd = await this.loadSprite(
      'UpRight Hold BottomCap Active 6x1'
    );

    this.note5 = await this.loadSprite('DownLeft Tap Note 6x1');
    this.note5Tail = await this.loadSprite('DownRight Hold Body Active 6x1');
    this.note5TailEnd = await this.loadSprite(
      'DownRight Hold BottomCap Active 6x1'
    );
    this.noteJudgements = await this.loadSprite('playerjudgement 1x6');
    this.noteExplosion = await this.loadSprite('GLOW 5x2');
    this.comboNumbers = await this.loadSprite('FIESTA 2 4x4');
  }

  private static loadSprite(name: string): Promise<Sprite> {
    const src = `sprites/${name}.png`;
    const yChunks = Number.parseInt(
      name.substring(name.length - 1, name.length)
    );
    const xChunks = Number.parseInt(
      name.substring(name.length - 3, name.length - 2)
    );
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = src;
      image.onload = () => {
        resolve({
          xChunks: xChunks,
          yChunks: yChunks,
          image,
        });
      };
      image.onerror = () => reject();
    });
  }

  public static drawChunk(
    sprite: Sprite,
    xChunk: number,
    yChunk: number,
    x: number,
    y: number,
    options?: {
      sourceX?: number;
      sourceY?: number;
      sourceWidth?: number;
      destWidth?: number;
      destHeight?: number;
    }
  ) {
    const chunkXSize = sprite.image.width / sprite.xChunks;
    const chunkYSize = sprite.image.height / sprite.yChunks;

    let sourceX = chunkXSize * xChunk;
    let sourceY = chunkYSize * yChunk;
    let destHeight = chunkYSize;
    let destWidth = chunkXSize;
    let sourceWidth = chunkXSize;

    if (options?.sourceX) {
      sourceX += options.sourceX;
    }
    if (options?.sourceY) {
      sourceY += options.sourceY;
    }
    if (options?.sourceWidth) {
      sourceWidth = options.sourceWidth;
      destWidth = sourceWidth
    }
    if (options?.destHeight) {
      destHeight = options.destHeight;
    }
    if (options?.destWidth) {
      destWidth = options.destWidth;
    }

    Canvas.context.drawImage(
      sprite.image,
      sourceX,
      sourceY,
      sourceWidth,
      chunkYSize,
      x,
      y,
      destWidth,
      destHeight
    );
  }
}

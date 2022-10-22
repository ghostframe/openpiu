import { Board } from './board';
import { Canvas } from './canvas';
import { Sprite, Sprites } from './sprites';
import { Track } from './track';

export class Notes {
  static lanesX = Array(5)
    .fill(null)
    .map((_, i) => i * 50);

  static width = 64;
  static height = 64;
  static xStart = Board.xStart + 28;
  static yStart = Board.yStart;

  static drawHeld(lane: number, yStart: number, yEnd: number) {
    switch (lane) {
      case 1:
        return Notes.draw1Held(yStart, yEnd);
      case 2:
        return Notes.draw2Held(yStart, yEnd);
      case 3:
        return Notes.draw3Held(yStart, yEnd);
      case 4:
        return Notes.draw4Held(yStart, yEnd);
      case 5:
        return Notes.draw5Held(yStart, yEnd);
    }
  }

  static draw(lane: number, y: number) {
    switch (lane) {
      case 1:
        return Notes.draw1(y);
      case 2:
        return Notes.draw2(y);
      case 3:
        return Notes.draw3(y);
      case 4:
        return Notes.draw4(y);
      case 5:
        return Notes.draw5(y);
    }
  }

  static draw1(y: number) {
    Notes.drawNote(Sprites.note1, 1, y);
  }

  static draw2(y: number) {
    Notes.drawNote(Sprites.note2, 2, y);
  }

  static draw3(y: number) {
    Notes.drawNote(Sprites.note3, 3, y);
  }

  static draw4(y: number) {
    const x = Notes.xLane(4);
    Canvas.context.save();
    Canvas.context.translate(x + Notes.width, Notes.yStart + y);
    Canvas.context.rotate(Math.PI * 0.5);
    Sprites.drawChunk(Sprites.note4, 0, 0, 0, 0);
    Canvas.context.restore();
  }

  static draw5(y: number) {
    const x = Notes.xLane(5) + 1;
    Canvas.context.save();
    Canvas.context.translate(x, Notes.yStart + Notes.height - 1 + y);
    Canvas.context.rotate(Math.PI * 1.5);
    Sprites.drawChunk(Sprites.note5, 0, 0, 0, 0);
    Canvas.context.restore();
  }

  static draw1Held(yStart: number, yEnd: number) {
    this.drawHeldInternal(
      Notes.draw1,
      Sprites.note1Tail,
      Sprites.note1TailEnd,
      1,
      yStart,
      yEnd
    );
  }

  static draw2Held(yStart: number, yEnd: number) {
    this.drawHeldInternal(
      Notes.draw2,
      Sprites.note2Tail,
      Sprites.note2TailEnd,
      2,
      yStart,
      yEnd
    );
  }

  static draw3Held(yStart: number, yEnd: number) {
    this.drawHeldInternal(
      Notes.draw3,
      Sprites.note3Tail,
      Sprites.note3TailEnd,
      3,
      yStart,
      yEnd
    );
  }

  static draw4Held(yStart: number, yEnd: number) {
    this.drawHeldInternal(
      Notes.draw4,
      Sprites.note4Tail,
      Sprites.note4TailEnd,
      4,
      yStart,
      yEnd
    );
  }

  static draw5Held(yStart: number, yEnd: number) {
    this.drawHeldInternal(
      Notes.draw5,
      Sprites.note5Tail,
      Sprites.note5TailEnd,
      5,
      yStart,
      yEnd
    );
  }

  private static drawNote(note: Sprite, lane: number, y: number) {
    const x = Notes.xLane(lane);
    Sprites.drawChunk(note, 0, 0, x, Notes.yStart + y);
  }

  static xLane(lane: number): number {
    return this.lanesX[lane - 1] + Notes.xStart;
  }

  private static drawHeldInternal(
    drawNote: (y: number) => void,
    tail: Sprite,
    tailEnd: Sprite,
    lane: number,
    yStart: number,
    yEnd: number
  ) {
    const x = Notes.xLane(lane);
    Sprites.drawChunk(tail, 0, 0, x, yStart + 48, {
      destHeight: yEnd + 23 - (yStart + 48),
    });
    const tailEndYOffset = Notes.getTailEndOffset(yEnd - yStart);
    const yEndWithOffset = yEnd + 14 + tailEndYOffset;
    Sprites.drawChunk(tailEnd, 0, 0, x, yEndWithOffset, {
      sourceX: 0,
      sourceY: tailEndYOffset,
    });
    drawNote(yStart);
  }

  static drawHitNoteAnimations() {
    const time = Track.getTimeMs();
    Object.entries(Track.hitNotes).forEach(([lane, hitTime]) => {
      const laneNumber = Number.parseInt(lane);
      const elapsedAnimationTime = time - hitTime;
      const animationDuration = 400;
      if (time - hitTime < animationDuration) {
        Canvas.context.save();
        Canvas.context.globalAlpha =
          1 - elapsedAnimationTime / animationDuration;
        Sprites.drawChunk(
          Sprites.noteExplosion,
          laneNumber - 1,
          1,
          Notes.xLane(laneNumber),
          this.yStart
        );
        Canvas.context.restore();
      }
    });
  }

  private static getTailEndOffset(yHeight: number) {
    if (yHeight < 15) {
      return 9 + 15 - yHeight;
    }
    return 9;
  }
}

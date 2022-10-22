import { Canvas } from './canvas';
import { centeredXCoordsFor, centeredYCoordsFor } from './util';
import { Sprites } from './sprites';
import { Track } from './track';
import { Controls } from './controls';
import { Notes } from './notes';

export class Board {
  static width = 320;
  static height = 64;
  static yStart = 16;
  static xStart = centeredXCoordsFor(Board.width).start;
  static xEnd = centeredXCoordsFor(Board.width).end;
  static image: HTMLImageElement | null = null;

  static draw() {
    Sprites.drawChunk(Sprites.board, 0, 0, this.xStart, this.yStart);
    if (Controls.heldLanes[1]) {
      this.drawPressedLane(1);
    }
    if (Controls.heldLanes[2]) {
      this.drawPressedLane(2);
    }
    if (Controls.heldLanes[3]) {
      this.drawPressedLane(3);
    }
    if (Controls.heldLanes[4]) {
      this.drawPressedLane(4);
    }
    if (Controls.heldLanes[5]) {
      this.drawPressedLane(5);
    }
  }

  private static drawPressedLane(lane: number) {
    const laneXPositions = [20, 84, 136, 185, 236];
    const laneWidths = [64, 52, 50, 53, 64];
    Canvas.context.save();
    Canvas.context.globalCompositeOperation = 'color-dodge';
    Sprites.drawChunk(
      Sprites.board,
      0,
      1,
      this.xStart + laneXPositions[lane - 1],
      this.yStart,
      {
        sourceX: laneXPositions[lane - 1],
        sourceWidth: laneWidths[lane - 1],
      }
    );
    Canvas.context.restore();
  }
}

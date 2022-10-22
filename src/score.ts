// Todo this

import { Board } from "./board";
import { Canvas } from "./canvas";
import { Sprites } from "./sprites";
import { Track } from "./track";
import { centeredXCoordsFor } from "./util";

// SSS: all perfects
// SS: all perfects and greats
// S: 95% or above accuracy
// A: 90% or above accuracy
// B: 85% or above accuracy
// C: 80% or above accuracy
// D: 75% or above accuracy
// F: below 75% accuracy

enum NoteJudgement {
  PERFECT,
  GREAT,
  GOOD,
  BAD,
  MISS,
}

export class Score {
  static playerHitWindowMs = 150;

  static score = 0;
  static combo = 0;

  static misses = 0;
  static perfects = 0;
  static greats = 0;
  static goods = 0;
  static bads = 0;

  static currentJudgement: NoteJudgement | null = null;
  static currentJudgementStartTime: number = -10000;

  static hit(offsetTime: number) {
    this.combo++;
    const offsetTimeAbs = Math.abs(offsetTime);
    const percentageOffset = (offsetTimeAbs * 100) / this.playerHitWindowMs;
    if (percentageOffset < 30) {
      this.perfect();
    } else if (percentageOffset < 50) {
      this.great();
    } else if (percentageOffset < 80) {
      this.good();
    } else {
      this.bad();
    }
  }

  static miss() {
    this.combo = 0;
    this.misses++;
    // this.score -= 500;
    this.currentJudgement = NoteJudgement.MISS;
    this.currentJudgementStartTime = Track.getTimeMs();
  }

  private static perfect() {
    if (this.combo > 50) {
      this.score += 1000;
    }
    this.score += 1000;
    this.perfects++;
    this.currentJudgement = NoteJudgement.PERFECT;
    this.currentJudgementStartTime = Track.getTimeMs();
  }

  private static great() {
    if (this.combo > 50) {
      this.score += 1000;
    }
    this.score += 500;
    this.greats++;
    this.currentJudgement = NoteJudgement.GREAT;
    this.currentJudgementStartTime = Track.getTimeMs();
  }

  private static good() {
    this.score += 200;
    this.goods++;
    this.currentJudgement = NoteJudgement.GOOD;
    this.currentJudgementStartTime = Track.getTimeMs();
  }

  private static bad() {
    // this.score -= 200;
    this.bads++;
    this.currentJudgement = NoteJudgement.BAD;
    this.currentJudgementStartTime = Track.getTimeMs();
  }

  static draw() {
    Canvas.context.save();
    Canvas.context.fillStyle = "white";
    Canvas.context.font = "16px Arial";
    Canvas.context.fillText(
      `Score: ${Score.score} \nCombo: ${Score.combo}`,
      Board.xEnd + 30,
      Board.yStart + 32
    );
    Canvas.context.restore();
    this.drawNoteJudgement();
  }

  static drawNoteJudgement() {
    const x = centeredXCoordsFor(Sprites.noteJudgements.image.width).start;
    const y = Board.yStart + 200;
    const now = Track.getTimeMs();
    const elapsedTime = now - this.currentJudgementStartTime;
    if (this.currentJudgement !== null && elapsedTime < 1000) {
      switch (this.currentJudgement) {
        case NoteJudgement.PERFECT:
          Sprites.drawChunk(Sprites.noteJudgements, 0, 1, x, y);
          break;
        case NoteJudgement.GREAT:
          Sprites.drawChunk(Sprites.noteJudgements, 0, 2, x, y);
          break;
        case NoteJudgement.GOOD:
          Sprites.drawChunk(Sprites.noteJudgements, 0, 3, x, y);
          break;
        case NoteJudgement.BAD:
          Sprites.drawChunk(Sprites.noteJudgements, 0, 4, x, y);
          break;
        case NoteJudgement.MISS:
          Sprites.drawChunk(Sprites.noteJudgements, 0, 5, x, y);
          break;
      }
    }
  }
}

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
    this.combo = 0;
    this.currentJudgement = NoteJudgement.BAD;
    this.currentJudgementStartTime = Track.getTimeMs();
  }

  static draw() {
    this.drawNoteJudgement();
    this.drawCombo();
  }

  private static findChunksFor(number: number): { x: number; y: number } {
    return {
      y: Math.floor(number / 4),
      x: number % 4,
    };
  }

  static drawCombo() {
    const now = Track.getTimeMs();
    const elapsedTime = now - this.currentJudgementStartTime;
    if (this.combo > 0 && elapsedTime < 1000) {
      let downscale = 1.5;
      if (elapsedTime < 50) {
        downscale -= elapsedTime / 50 / 4;
      }
      const units = this.combo % 10;
      const tenths = Math.floor((this.combo % 100) / 10);
      const hundreds = Math.floor((this.combo % 1000) / 100);
      const comboNumberOriginalWidth = Sprites.comboNumbers.image.width / 4;
      const comboNumberOriginalHeight = Sprites.comboNumbers.image.height / 4;
      const desiredComboNumberWidth = comboNumberOriginalWidth / downscale;
      const desiredComboNumberHeight = comboNumberOriginalHeight / downscale;
      const y = Board.yStart + 240;
      const hundredsX = centeredXCoordsFor(desiredComboNumberWidth * 3).start;
      const tenthsX = hundredsX + desiredComboNumberWidth;
      const unitX = hundredsX + desiredComboNumberWidth * 2;
      const unitChunks = this.findChunksFor(units);
      const tenthChunks = this.findChunksFor(tenths);
      const hundredsChunks = this.findChunksFor(hundreds);

      Sprites.drawChunk(
        Sprites.comboNumbers,
        unitChunks.x,
        unitChunks.y,
        unitX,
        y,
        {
          destWidth: desiredComboNumberWidth,
          destHeight: desiredComboNumberHeight,
        }
      );
      Sprites.drawChunk(
        Sprites.comboNumbers,
        tenthChunks.x,
        tenthChunks.y,
        tenthsX,
        y,
        {
          destWidth: desiredComboNumberWidth,
          destHeight: desiredComboNumberHeight,
        }
      );
      Sprites.drawChunk(
        Sprites.comboNumbers,
        hundredsChunks.x,
        hundredsChunks.y,
        hundredsX,
        y,
        {
          destWidth: desiredComboNumberWidth,
          destHeight: desiredComboNumberHeight,
        }
      );
    }
  }

  static drawNoteJudgement() {
    const now = Track.getTimeMs();
    const elapsedTime = now - this.currentJudgementStartTime;
    if (this.currentJudgement !== null && elapsedTime < 1000) {
      let downscale = 1;
      if (elapsedTime < 50) {
        downscale -= elapsedTime / 50 / 6;
      }
      const y = Board.yStart + 180 + (downscale * 15);
      const judgementOriginalWidth = Sprites.noteJudgements.image.width;
      const judgementOriginalHeight = Sprites.noteJudgements.image.height / 6;
      const x = centeredXCoordsFor(judgementOriginalWidth / downscale).start;
      const options = {
        destWidth: judgementOriginalWidth / downscale,
        destHeight: judgementOriginalHeight / downscale,
      };
      switch (this.currentJudgement) {
        case NoteJudgement.PERFECT:
          Sprites.drawChunk(Sprites.noteJudgements, 0, 1, x, y, options);
          break;
        case NoteJudgement.GREAT:
          Sprites.drawChunk(Sprites.noteJudgements, 0, 2, x, y, options);
          break;
        case NoteJudgement.GOOD:
          Sprites.drawChunk(Sprites.noteJudgements, 0, 3, x, y, options);
          break;
        case NoteJudgement.BAD:
          Sprites.drawChunk(Sprites.noteJudgements, 0, 4, x, y, options);
          break;
        case NoteJudgement.MISS:
          Sprites.drawChunk(Sprites.noteJudgements, 0, 5, x, y, options);
          break;
      }
    }
  }
}

import { Board } from './board';
import { Canvas } from './canvas';
import { Notes } from './notes';
import { Sprites } from './sprites';
import { Track } from './track';
import { Controls } from './controls';
import { Score } from './score';

export type Song = {
  title: string;
  difficulties: Array<string>;
  stepFilename: string;
  artist: string;
};

export class Game {
  static noteSpeed = 0.35;
  static started = false;

  static async start(song: Song, difficultyIndex: number) {
    if (!Game.started) {
      await Sprites.load();
      await Track.start(song, difficultyIndex);
      Game.started = true;
      Game.drawFrame();
    }
  }

  static drawFrame() {
    // Drawing
    Game.clearScreen();
    Board.draw();
    Notes.drawHitNoteAnimations();
    Game.drawNotes();
    Score.draw();

    // Calculation
    Controls.processGamepadInput();
    Controls.checkGoneNotes();
    Track.checkGoneHeldNotes();

    window.requestAnimationFrame(Game.drawFrame);
  }

  private static noteTimeToPx(noteTime: number, currentTime: number): number {
    const noteRelative = noteTime - currentTime;
    return noteRelative * Game.noteSpeed;
  }

  static drawNotes() {
    const timeMs = Track.getTimeMs();
    Track.getNotes().forEach((note) => {
      if (!note.endTime) {
        Notes.draw(note.lane, this.noteTimeToPx(note.time, timeMs));
      } else {
        Notes.drawHeld(
          note.lane,
          this.noteTimeToPx(note.time, timeMs),
          this.noteTimeToPx(note.endTime, timeMs)
        );
      }
    });
    Track.heldNotes.forEach((heldNote) => {
      Notes.drawHeld(
        heldNote.lane,
        0,
        this.noteTimeToPx(heldNote.endTime!!, timeMs)
      );
    });
  }

  static clearScreen() {
    Canvas.context?.clearRect(0, 0, Canvas.width, Canvas.height);
  }
}

Controls.bind();
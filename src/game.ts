import { Board } from './board';
import { Canvas } from './canvas';
import { Notes } from './notes';
import { Sprites } from './sprites';
import { Track } from './track';
import { Controls } from './controls';
import { Results, Score } from './score';

export type Difficulty = {
  index: number;
  type: string;
  name: string;
};

export type GameEvent = {
  type: 'ended';
  results: Results;
};

export type Song = {
  title: string;
  difficulties: Array<Difficulty>;
  stepFilename: string;
  artist: string;
};

export class Game {
  static useDebugNoteClicker = false;
  static debugNoteClick: HTMLAudioElement | null = null;
  static noteSpeed = 0.4;
  static started = false;
  static ended = false;
  static eventListener: (event: GameEvent) => void = () => {};

  static async start(
    song: Song,
    difficultyIndex: number,
    eventListener?: (event: GameEvent) => void
  ) {
    if (eventListener) {
      this.eventListener = eventListener;
    }
    if (!Game.started) {
      await Sprites.load();
      await Track.start(song, difficultyIndex);
      Game.started = true;
      Game.drawFrame();
    }
    if (this.useDebugNoteClicker) {
      this.debugNoteClick = new Audio();
      this.debugNoteClick.src = 'debugNoteClick.wav';
      this.debugNoteClick.load();
    }
  }

  static end() {
    this.ended = true;
    this.eventListener({
      type: 'ended',
      results: Score.getResults(),
    });
  }

  static drawFrame() {
    if (!Game.ended) {
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
      if (Game.useDebugNoteClicker) {
        Game.processDebugNoteClick();
      }

      window.requestAnimationFrame(Game.drawFrame);
    }
  }

  private static processDebugNoteClick() {
    const trackTime = Track.getTimeMs();
    if (Track.getNotes().some((note) => Math.abs(note.time - trackTime) <= 8)) {
      this.debugNoteClick?.play();
    }
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

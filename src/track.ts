import { Lane } from './controls';
import { Note, parseStepFile } from './noteParser';
import { Score } from './score';
import { Game, Song } from './game';
const YTPlayer = require('yt-player');
const player = new YTPlayer('#player');

export class Track {
  static audio: HTMLAudioElement;
  private static notes: Array<Note>;
  static heldNotes: Array<Note> = [];
  static hitNotes: Record<Lane, number> = {
    1: -100000,
    2: -100000,
    3: -100000,
    4: -100000,
    5: -100000,
  };

  static getNotes() {
    return this.notes;
  }

  static async start(song: Song, difficultyIndex: number) {
    const stepContentsFetch = await fetch(song.stepFilename);
    const stepContents = await stepContentsFetch.text();
    const step = parseStepFile(stepContents, difficultyIndex);
    this.notes = step.notes;
    player.load(step.youtubeId);
    player.setVolume(100);
    player.on('unstarted', () => {
      player.seek(0);
      player.play();
    });
    player.on('ended', () => {
      Game.end()
    })
  }

  static stop() {
    player.stop()
  }

  static notePressed(index: number) {
    const pressedNote = this.notes[index];
    const offsetTime = pressedNote.time - this.getTimeMs();
    if (pressedNote.endTime) {
      this.heldNotes.push(pressedNote);
    }
    this.notes.splice(index, 1);
    this.hitNotes[pressedNote.lane as Lane] = Track.getTimeMs();
    Score.hit(offsetTime);
  }

  static laneReleased(lane: Lane) {
    const heldNoteIndex = this.heldNotes.findIndex(
      (note) => note.lane === lane
    );
    if (heldNoteIndex !== -1) {
      this.heldNotes.splice(heldNoteIndex, 1);
    }
  }

  static noteMiss(index: number) {
    this.notes[index].missed = true;
    Score.miss();
  }

  static checkGoneHeldNotes() {
    const goneHeldNote = this.heldNotes.findIndex(
      (heldNote) => heldNote.endTime!! < this.getTimeMs()
    );
    if (goneHeldNote !== -1) {
      this.heldNotes.splice(goneHeldNote);
    }
  }

  static getTimeMs(): number {
    return player.getCurrentTime() * 1000;
  }
}

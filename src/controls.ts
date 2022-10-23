import { Note } from "./noteParser";
import { Score } from "./score";
import { Track } from "./track";

export type Lane = 1 | 2 | 3 | 4 | 5;

export class Controls {
  static heldLanes = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  };
  static keyMappings: Record<string, Lane> = {
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 1,
    "7": 2,
    "8": 3,
    "9": 4,
    "0": 5,
  };

  static gamepadMappings: Record<string, Lane> = {
    1: 1,
    2: 2,
    3: 3,
    7: 4,
    0: 5,
  };

  static gamepadButtonsPressedState: Record<number, boolean> = {};

  static bind() {
    document.addEventListener("keydown", (ev) => {
      this.keyPressed(ev.key);
    });
    document.addEventListener("keyup", (ev) => {
      this.keyReleased(ev.key);
    });
  }

  static processGamepadInput() {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
      const buttonsWithState = gamepads[0].buttons.map((button, index) => ({
        pressed: button.pressed,
        index,
      }));
      const pressedButtonIndexes = buttonsWithState
        .filter((button) => button.pressed)
        .map((button) => button.index);
      const notPressedButtonIndexes = buttonsWithState
        .filter((button) => !button.pressed)
        .map((button) => button.index);

      pressedButtonIndexes.forEach((buttonIndex) =>
        this.gamepadButtonDown(buttonIndex)
      );
      notPressedButtonIndexes.forEach((buttonIndex) =>
        this.gamepadButtonUp(buttonIndex)
      );
    }
  }

  static checkGoneNotes() {
    const currentTime = Track.getTimeMs();
    const goneNoteIndex = Track.getNotes().findIndex(
      (note) => this.noteIsGone(note, currentTime) && !note.missed
    );
    if (goneNoteIndex !== -1) {
      Track.noteMiss(goneNoteIndex);
    }
  }

  private static lanePressed(lane: number) {
    if (!this.heldLanes[lane as Lane]) {
      // It's being pressed, not held
      const currentTime = Track.getTimeMs();
      const closeNoteIndex = Track.getNotes().findIndex(
        (note) => note.lane === lane && this.noteIsClose(note, currentTime)
      );
      if (closeNoteIndex !== -1) {
        Track.notePressed(closeNoteIndex);
      }
      this.heldLanes[lane as Lane] = true;
    }
  }

  private static laneReleased(lane: number) {
    this.heldLanes[lane as Lane] = false;
    Track.laneReleased(lane as Lane);
  }

  private static noteIsClose(note: Note, timeMs: number): boolean {
    return Math.abs(note.time - timeMs) < Score.playerHitWindowMs;
  }

  private static noteIsGone(note: Note, timeMs: number): boolean {
    return note.time - timeMs <= -Score.playerHitWindowMs;
  }

  private static keyPressed(key: string): void {
    const mappedLane = this.keyMappings[key];
    if (mappedLane) {
      Controls.lanePressed(mappedLane);
    }
  }

  private static keyReleased(key: string): void {
    const mappedLane = this.keyMappings[key];
    if (mappedLane) {
      Controls.laneReleased(mappedLane);
    }
  }

  private static gamepadButtonDown(buttonIndex: number) {
    if (!this.gamepadButtonsPressedState[buttonIndex]) {
      // To not register it as multiple presses
      this.gamepadButtonsPressedState[buttonIndex] = true;
      const mappedLane = this.gamepadMappings[buttonIndex];
      if (mappedLane) {
        Controls.lanePressed(mappedLane);
      }
    }
  }

  private static gamepadButtonUp(buttonIndex: number) {
    if (this.gamepadButtonsPressedState[buttonIndex]) {
      this.gamepadButtonsPressedState[buttonIndex] = false;
      const mappedLane = this.gamepadMappings[buttonIndex];
      if (mappedLane) {
        Controls.laneReleased(mappedLane);
      }
    }
  }
}

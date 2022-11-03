export type Note = {
  lane: number;
  time: number;
  missed: boolean;
  endTime: number | null;
};

const lineSeparatorRegex = '[\r\n]+';

type Event = {
  beats: number;
  value: number;
};

type BPM = Event;
type Delay = Event;

type Step = {
  youtubeId: string;
  notes: Array<Note>;
};

const AV_DELAY = 50;

function parseEventField(
  noteData: string,
  field: string,
  difficultyIndex: number
): Array<Event> {
  const eventsStr = parseFieldRepeated(noteData, field)[difficultyIndex + 1];
  if (eventsStr.length === 0) {
    return [];
  }
  return eventsStr.split(',').map((eventStr) => {
    const eventSplit = eventStr.match(/(.*)=(.*)/);
    return {
      beats: Number.parseFloat(eventSplit!![1]),
      value: Number.parseFloat(eventSplit!![2]),
    };
  });
}

function beatsToMs(beats: number, bpm: BPM) {
  const beatsPerMinute = bpm.value;
  const beatsPerSecond = beatsPerMinute / 60;
  const millisecondsPerBeat = 1000 / beatsPerSecond;
  return beats * millisecondsPerBeat;
}

function beatAndMeasureToMs(
  measure: number,
  measureDivision: number,
  beat: number,
  bpms: Array<BPM>,
  delays: Array<Delay>,
  initialOffset: number
): number {
  const beatsFromStart = (measure + beat / measureDivision) * 4;

  const bpmsFromStart = bpms.filter((bpm) => bpm.beats < beatsFromStart);
  const currentBpm = bpmsFromStart[bpmsFromStart.length - 1];
  var currentBpmOffsetMs = 0;
  for (var i = 0; i < bpmsFromStart.length - 1; i++) {
    const bpm = bpmsFromStart[i];
    const nextBpm = bpmsFromStart[i + 1];
    const bpmDurationTicks = nextBpm.beats - bpm.beats;
    currentBpmOffsetMs += beatsToMs(bpmDurationTicks, bpm);
  }

  const delaysFromStart = delays.filter(
    (delay) => delay.beats < beatsFromStart
  );
  var currentDelayOffsetMs = 0;
  delaysFromStart.forEach(
    (delay) => (currentDelayOffsetMs += delay.value * 1000)
  );

  const ticksOfCurrentBpm = beatsFromStart - currentBpm.beats;

  return (
    beatsToMs(ticksOfCurrentBpm, currentBpm) +
    initialOffset +
    currentBpmOffsetMs +
    currentDelayOffsetMs +
    AV_DELAY
  );
}

function parseFieldSingle(stepStr: string, field: string): string {
  const match = stepStr.match(new RegExp(`#${field}:(.*?);`));
  return match!![1];
}

function parseFieldRepeated(stepStr: string, field: string): Array<string> {
  const fieldMatches = stepStr.matchAll(
    new RegExp(`#${field}:([\\s\\S]*?);`, 'g')
  );
  return Array.from(fieldMatches, (match) => match[1]);
}

function stripComments(str: string): string {
  return str.replaceAll(new RegExp('\\s*//(.*)', 'g'), '');
}

function parseNotes(
  noteDataStr: string,
  bpms: Array<BPM>,
  delays: Array<Delay>,
  initialOffset: number
): Array<Note> {
  const measureSeparator = new RegExp(
    `${lineSeparatorRegex},${lineSeparatorRegex}`
  );
  const measuresStr: Array<string> = noteDataStr.split(measureSeparator);
  const measures = measuresStr.map((measure) =>
    measure
      .split(new RegExp(lineSeparatorRegex))
      .filter((line) => line.length > 0)
  );

  const currentlyHeldNotes: Record<number, Note> = {};

  const notes = [];
  for (
    var measureNumber = 0;
    measureNumber < measures.length;
    measureNumber++
  ) {
    const measure = measures[measureNumber];
    for (var division = 0; division < measure.length; division++) {
      const divisionStr = measure[division];
      if (divisionStr.length === 5) {
        for (var lane = 0; lane < divisionStr.length; lane++) {
          const laneNote = divisionStr[lane];
          const noteValue = Number.parseInt(laneNote);
          if (noteValue === 1 || noteValue === 2) {
            const noteBeginMs = beatAndMeasureToMs(
              measureNumber,
              measure.length,
              division,
              bpms,
              delays,
              initialOffset
            );
            const note: Note = {
              lane: lane + 1,
              time: noteBeginMs,
              missed: false,
              endTime: null,
            };
            notes.push(note);
            if (noteValue === 2) {
              currentlyHeldNotes[lane] = note;
            }
          } else if (noteValue === 3 && currentlyHeldNotes[lane]) {
            const noteEndMs = beatAndMeasureToMs(
              measureNumber,
              measure.length,
              division,
              bpms,
              delays,
              initialOffset
            );
            currentlyHeldNotes[lane].endTime = noteEndMs;
          }
        }
      }
    }
  }
  return notes;
}

export function parseStepFile(
  fileContents: string,
  difficultyIndex: number
): Step {
  fileContents = stripComments(fileContents);
  const youtubeId = parseFieldSingle(fileContents, 'YOUTUBEID');
  const youtubeOffset = Number.parseFloat(
    parseFieldSingle(fileContents, 'YOUTUBEOFFSET')
  );
  const notesStr = parseFieldRepeated(fileContents, 'NOTES')[difficultyIndex];
  const bpms = parseEventField(fileContents, 'BPMS', difficultyIndex);
  const delays = parseEventField(fileContents, 'DELAYS', difficultyIndex);
  const notes = parseNotes(notesStr, bpms, delays, youtubeOffset);
  return {
    notes,
    youtubeId,
  };
}

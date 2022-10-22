export type Note = {
  lane: number;
  time: number;
  missed: boolean;
  endTime: number | null;
};

const lineSeparatorRegex = "[\r\n]+";

type BPM = {
  ticks: number;
  value: number;
};

type Step = {
  youtubeId: string;
  notes: Array<Note>;
};

function parseBpms(noteData: string): Array<BPM> {
  const bpmsStr = noteData.match(/BPMS:([\s\S]*?);/)!![1];
  return bpmsStr.split(",").map((bpmStr) => {
    const bpmSplit = bpmStr.match(/(.*)=(.*)/);
    return {
      ticks: Number.parseFloat(bpmSplit!![1]),
      value: Number.parseFloat(bpmSplit!![2]),
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
  songOffset: number
): number {
  const beatsFromStart = (measure + beat / measureDivision) * 4;
  
  const bpmsFromStart = bpms.filter((bpm) => bpm.ticks < beatsFromStart);
  const currentBpm = bpmsFromStart[bpmsFromStart.length - 1];
  var currentBpmOffsetMs = 0;
  for (var i = 0; i < bpmsFromStart.length - 1; i++) {
    const bpm = bpmsFromStart[i]
    const nextBpm = bpmsFromStart[i + 1]
    const bpmDurationTicks = (nextBpm.ticks - bpm.ticks);
    currentBpmOffsetMs += beatsToMs(bpmDurationTicks, bpm)
  }

  const ticksOfCurrentBpm = beatsFromStart - currentBpm.ticks;

  return beatsToMs(ticksOfCurrentBpm, currentBpm) + songOffset + currentBpmOffsetMs;
}

function parseFieldSingle(stepStr: string, field: string): string {
  const match = stepStr.match(new RegExp(`#${field}:(.*?);`));
  if (!match) {
    throw new Error(`No match for field '${field}'!`)
  }
  return match[1];  
}

export function parseStepFile(
  fileContents: string,
  difficultyIndex: number
): Step {
  fileContents = fileContents.replaceAll(new RegExp("\\s*//(.*)", "g"), "");
  const youtubeId = parseFieldSingle(fileContents, "YOUTUBEID");
  const youtubeOffset = Number.parseFloat(parseFieldSingle(fileContents, "YOUTUBEOFFSET"));
  const noteDataStr = fileContents.split(
    new RegExp(`#NOTEDATA:;${lineSeparatorRegex}`)
  )[difficultyIndex + 1];
  const bpms = parseBpms(noteDataStr);

  const measureSeparator = new RegExp(
    `${lineSeparatorRegex},${lineSeparatorRegex}`
  );
  const measures = noteDataStr
    .split(measureSeparator)
    .map((measure) => measure.split(new RegExp(lineSeparatorRegex)));

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
              youtubeOffset
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
              youtubeOffset
            );
            currentlyHeldNotes[lane].endTime = noteEndMs;
          }
        }
      }
    }
  }
  return {
    notes,
    youtubeId,
  };
}

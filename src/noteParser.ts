export type Note = {
  lane: number;
  time: number;
  missed: boolean;
  endTime: number | null;
};

const lineSeparatorRegex = '[\r\n]+';

type BPM = {
  ticks: number;
  value: number;
};

type Step = {
  music: string;
  youtubeId: string;
  notes: Array<Note>;
};

// Receives something like
function parseBpms(noteData: string): Array<BPM> {
  const bpmsStr = noteData.match(/BPMS:([\s\S]*?);/)!![1];
  return bpmsStr.split(',').map((bpmStr) => {
    const bpmSplit = bpmStr.match(/(.*)=(.*)/);
    return {
      ticks: Number.parseFloat(bpmSplit!![1]),
      value: Number.parseFloat(bpmSplit!![2]),
    };
  });
}

function beatAndMeasureToMs(
  measure: number,
  measureDivision: number,
  beat: number,
  bpms: Array<BPM>,
  offset: number
): number {
  const beatsPerMinute = bpms[0].value;
  const beatsPerSecond = beatsPerMinute / 60;
  const millisecondsPerBeat = 1000 / beatsPerSecond;
  const noteBeginTicks = (measure + beat / measureDivision) * 4;
  return millisecondsPerBeat * noteBeginTicks + offset;
}

function parseOffset(noteData: string): number {
  const offsetStr = noteData.match(/#OFFSET:(.*?);/)!![1];
  return Number.parseFloat(offsetStr);
}

function parseMusic(stepStr: string): string {
  return stepStr.match(/#MUSIC:(.*?);/)!![1];
}

function parseYoutubeId(stepStr: string): string {
  return stepStr.match(/#YOUTUBEID:(.*?);/)!![1];
}

function parseYoutubeOffset(stepStr: string): string {
  return stepStr.match(/#YOUTUBEOFFSET:(.*?);/)!![1];
}

export function parseStepFile(
  fileContents: string,
  difficultyIndex: number
): Step {
  fileContents = fileContents.replaceAll(new RegExp('\\s*//(.*)', 'g'), '');
  const youtubeId = parseYoutubeId(fileContents);
  const youtubeOffset = Number.parseFloat(parseYoutubeOffset(fileContents));
  const music = parseMusic(fileContents);
  const noteDataStr = fileContents.split(
    new RegExp(`#NOTEDATA:;${lineSeparatorRegex}`)
  )[difficultyIndex + 1];
  const offset = parseOffset(noteDataStr);
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
    music,
    notes,
    youtubeId,
  };
}

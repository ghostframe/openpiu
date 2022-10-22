const glob = require('glob');
const fs = require('fs');

const lineSeparatorRegex = "[\r\n]+";

function matchField(songFileStr, fieldName) {
  return songFileStr.match(new RegExp(`#${fieldName}:(.*);${lineSeparatorRegex}`))[1]
}

function matchMultiple(songFileStr, fieldName) {
  return [...songFileStr.matchAll(new RegExp(`#${fieldName}:(.*);${lineSeparatorRegex}`, 'g'))]
    .map(match => match[1])
}

function parseSongMetadata(stepFilename) {
  const songFileStr = fs.readFileSync(stepFilename).toString()
  const title = matchField(songFileStr, 'TITLE');
  const difficulties = matchMultiple(songFileStr, "DESCRIPTION")
  const artist = matchField(songFileStr, 'ARTIST')
  return {
    title,
    difficulties,
    stepFilename,
    artist
  }
}

function stripRootDirectory(songMetadata) {
  const stepFilenameWithoutRoot = songMetadata.stepFilename.substring('public/'.length)
  songMetadata.stepFilename = stepFilenameWithoutRoot
}

function scanSongs() {
  const stepFilenames = glob.sync('public/songs/**/*.ssc')
  const songsMetadata = stepFilenames.map(parseSongMetadata)
  songsMetadata.forEach(stripRootDirectory);
  console.log('Writing: ', JSON.stringify(songsMetadata))
  fs.writeFileSync("./public/songs/songs.json", JSON.stringify(songsMetadata, "", 2))
}

scanSongs()

import type { NextPage } from "next";
import Head from "next/head";
import { ChangeEvent, useState } from "react";
import SONGS from "../public/songs/songs.json";
// import { Game } from "../src";

const Home: NextPage = () => {
  const [songIndex, setSongIndex] = useState(0);
  const [difficultyIndex, setDifficultyIndex] = useState(0);

  return (
    <div>
      <Head>
        <title>OpenPIU</title>
      </Head>

      <main>
        <div>
          <select
            id="song"
            onChange={(event) =>
              setSongIndex(Number.parseInt(event.target.value))
            }
          >
            {SONGS.map((song, index) => (
              <option key={song.title} value={index}>
                {song.artist} - {song.title}
              </option>
            ))}
          </select>
          <select id="difficulty" onChange={(event) => {
            setDifficultyIndex(Number.parseInt(event.target.value))
          }}>
            {SONGS[songIndex].difficulties.map((difficulty, index) => (
              <option key={difficulty} value={index}>
                {difficulty}
              </option>
            ))}
          </select>
          <button
            id="play"
            onClick={() => {
              import("../src/index").then(({ Game }) => {
                Game.start(SONGS[songIndex], difficultyIndex);
              });
            }}
          >
            Play
          </button>
        </div>
        <div className="game-container">
          <div id="player" className="player"></div>
          <canvas
            id="game"
            width="1000"
            height="600"
            className="canvas"
          ></canvas>
        </div>
      </main>

      <footer></footer>
    </div>
  );
};

export default Home;

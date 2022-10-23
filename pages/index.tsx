import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import SONGS from "../public/songs/songs.json";
import { Song } from "../src/game";
import { Results } from "../src/score";

const Home: NextPage = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameResults, setGameResults] = useState<Results | null>(null);

  function startGame(song: Song, difficultyIndex: number) {
    setGameStarted(true);
    import("../src/game").then(({ Game }) => {
      Game.start(song, difficultyIndex, (event) => {
        setGameResults(event.results);
      });
    });
  }

  return (
    <div>
      <Head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-Zenh87qX5JnK2Jl0vWa8Ck2rdkQ2Bzep5IDxbcnCeuOxjzrPF/et3URy9Bv1WTRi"
          crossOrigin="anonymous"
        ></link>
        <link
          rel="stylesheet"
          href="https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css"
        ></link>
        <title>OpenPIU</title>
      </Head>

      <main>
        {!gameStarted && !gameResults && (
          <div>
            <h1 className="mb-3 p-3 text-center" style={{ color: "#40dbc9" }}>
              <i className="las la-dragon"></i> OpenPIU
            </h1>

            <div className="d-flex justify-content-center">
              <div className="col-6">
                <h1 className="text-light">Songs</h1>
                {SONGS.map((song) => (
                  <div className="card text-bg-dark mb-2" key={song.title}>
                    <div className="card-body">
                      <h5 className="card-title">
                        {song.artist} - {song.title}
                      </h5>
                      {song.difficulties
                        .filter(
                          (difficulty) => difficulty.type === "pump-single"
                        )
                        .map((difficulty) => (
                          <a
                            key={difficulty.index}
                            href="#"
                            className="card-link"
                            onClick={(ev) => startGame(song, difficulty.index)}
                          >
                            {difficulty.name}
                          </a>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameStarted && !gameResults && (
          <div>
            <div className="game-container">
              <div id="player" className="player"></div>
              <canvas
                id="game"
                width="1000"
                height="600"
                className="canvas"
              ></canvas>
            </div>
            <button
              className="btn btn-dark"
              style={{ position: "absolute", left: "1px", top: "10px" }}
              onClick={(ev) => document.location.reload()}
            >
              Back
            </button>
          </div>
        )}

        {gameResults && (
          <div>
            <h1 className="mb-3 p-3 text-center" style={{ color: "#40dbc9" }}>
              <i className="las la-dragon"></i> OpenPIU
            </h1>
            <div className="d-flex text-light justify-content-center text-center">
              <div className="col-6">
                <h1>Your score was: {gameResults.score}</h1>
                <p>
                  Perfects: {gameResults.perfects}
                  <br></br>
                  Greats: {gameResults.greats}
                  <br></br>
                  Goods: {gameResults.goods}
                  <br></br>
                  Bads: {gameResults.bads}
                  <br></br>
                  Misses: {gameResults.misses}
                </p>
                <p>Max combo: {gameResults.maxCombo}</p>
                <button className="btn btn-primary" onClick={() => document.location.reload()}>Play again!</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer></footer>
    </div>
  );
};

export default Home;

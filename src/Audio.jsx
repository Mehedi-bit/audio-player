import { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";

import NatureAudio from "./assets/audio/nature_sounds.mp3";
import Song1 from "./assets/audio/song1.mp3";
import Song2 from "./assets/audio/song2.mp3";
import WaterAudio from "./assets/audio/flowing_water.mp3";

const Audio = () => {
  // State variables to manage the audio player
  const [selectedAudios, setSelectedAudios] = useState([]);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(false);

  // Ref to keep track of audio references for each audio
  const audioRefs = useRef({});

  // Ref for the interval used for updating the playhead
  const intervalRef = useRef();

  // Log the audioRefs to the console
  console.log(audioRefs);

  // Effect to clear the interval on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Effect to update playhead position and handle audio playback
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
        const newPosition = Math.min(playheadPosition + (playbackRate * 1), 30);
        setPlayheadPosition(newPosition);
        if (newPosition === 30) {
          clearInterval(intervalRef.current);
        }

        selectedAudios.forEach((audio) => {
          const audioRef = audioRefs.current[audio.id];
          if (
            playheadPosition >= audio.position &&
            newPosition <= audioRef.duration
          ) {
            const audioStartTime = newPosition - audio.position;
            audioRef.currentTime = audioStartTime.toFixed(0);
            audioRef.play();
          } else {
            audioRef.pause();
          }
        });
      }, 1000 / playbackRate);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, playheadPosition, selectedAudios, playbackRate]);

  // Function to handle audio click and add it to the selectedAudios state
  const handleAudioClick = (audioId, color) => {
    const newAudio = {
      id: audioId,
      position: playheadPosition,
      duration: 0,
      color: color,
    };
    setSelectedAudios([...selectedAudios, newAudio]);

    const tempAudio = new Audio(audioId);
    tempAudio.onloadedmetadata = () => {
      newAudio.duration = tempAudio.duration;
      setSelectedAudios([...selectedAudios]);
    };

    audioRefs.current[audioId] = tempAudio;
  };

  // Function to handle the play button click
  const handlePlayButtonClick = () => {
    setIsPlaying(true);
    setPlayheadPosition(0);
    setTimer(0);
    setPlaybackRate(1);

    selectedAudios.forEach((audio) => {
      const audioRef = audioRefs.current[audio.id];
      audioRef.currentTime = 0;
      audioRef.play();
    });
  };

  // Function to handle the pause button click
  const handlePauseButtonClick = () => {
    setIsPlaying(false);

    selectedAudios.forEach((audio) => {
      const audioRef = audioRefs.current[audio.id];
      audioRef.pause();
    });
  };

  // Function to handle the playhead drag
  const handleLineDrag = (event, data) => {
    const newPosition = Math.max(0, Math.min(data.x / 10, 30));
    setPlayheadPosition(newPosition);
    setTimer(30 - newPosition.toFixed(0));

    selectedAudios.forEach((audio) => {
      const audioRef = audioRefs.current[audio.id];
      audioRef.pause();
    });
  };

  // Function to handle audio drag and update its position
  const handleAudioDrag = (event, data, audioIndex) => {
    const { x } = data;
    const newPosition = Math.max(0, Math.min(x / 10, 30));

    const draggedAudio = selectedAudios[audioIndex];
    const audioStartTime = newPosition;
    const audioDuration = draggedAudio.duration;

    setSelectedAudios((prevAudios) => {
      const updatedAudios = [...prevAudios];
      updatedAudios[audioIndex] = {
        ...draggedAudio,
        position: audioStartTime,
        duration: audioDuration,
      };
      return updatedAudios;
    });
  };

  // Function to handle the end of an audio track
  const handleAudioEnded = (audioId) => {
    setPlaybackRate(1);
  };

  // Function to toggle playback speed between 1x and 2x
  const handlePlaybackSpeed = () => {
    switch (playbackRate) {
      case 1:
        setPlaybackRate(2);
        setPlaySpeed(true);
        break;
      case 2:
        setPlaybackRate(1);
        setPlaySpeed(false);
        break;
      default:
        setPlaybackRate(1);
        break;
    }
  };

  return (
    <div className="w-screen h-screen bg-black  absolute top-0 right-0 bottom-0 left-0 overflow-x-hidden">
      <div className="  w-full  flex flex-col  gap-y-6 mt-6">
        <h2 className="text-2xl  mt-3 text-white font-semibold">Camba.ai</h2>
        <div className="flex  justify-center items-center gap-x-2 text-[0.8rem] md:text-[1rem] text-white font-semibold md:gap-x-8">
          <div
            className="  w-44 md:w-64 h-12 sm:h-16 cursor-pointer bg-[#6C7D47] shadow-md rounded-xl flex_center hover:scale-[1.1] transition-all duration-200"
            onClick={() => handleAudioClick(NatureAudio, "#6C7D47")}
          >
            Nature calling
          </div>
          <div
            className=" w-44 md:w-64 h-12 sm:h-16 cursor-pointer flex_center bg-[#0E79B2] shadow-md rounded-xl text-center hover:scale-[1.1] transition-all du"
            onClick={() => handleAudioClick(Song1, "#0E79B2")}
          >
            Song 1
          </div>
          <div
            className="  w-44 md:w-64 h-12 sm:h-16 cursor-pointer bg-[#BF1363] shadow-md rounded-xl flex_center hover:scale-[1.1] transition-all duration-200"
            onClick={() => handleAudioClick(Song2, "#BF1363")}
          >
            Song 2
          </div>
          <div
            className=" w-44 md:w-64 h-12 sm:h-16 cursor-pointer flex_center bg-[#F39237] shadow-md rounded-xl text-center hover:scale-[1.1] transition-all du"
            onClick={() => handleAudioClick(WaterAudio, "#F39237")}
          >
            Water flowing
          </div>
        </div>
        <div className="flex justify-around items-center ">
          <div className="text-white">
            Time: {timer === 31 ? 30 : timer + ":00"} /30:00
          </div>
          <div className="self-center">
            {isPlaying ? (
              <svg
                stroke="currentColor"
                fill="white"
                onClick={handlePauseButtonClick}
                strokeWidth="0"
                viewBox="0 0 448 512"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"></path>
              </svg>
            ) : (
              <svg
                stroke="currentColor"
                fill="white"
                onClick={handlePlayButtonClick}
                strokeWidth="0"
                viewBox="0 0 448 512"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path>
              </svg>
            )}
            {/* <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={handlePauseButtonClick}>Pause</button> */}
          </div>

          {playSpeed ? (
            <div
              className="w-4 h-4 flex_center text-white font-semibold cursor-pointer"
              onClick={handlePlaybackSpeed}
            >
              2X
            </div>
          ) : (
            <div
              className="w-4 h-4 flex_center text-white font-semibold cursor-pointer"
              onClick={handlePlaybackSpeed}
            >
              1X
            </div>
          )}
        </div>

        <div className="relative mt-8  rounded-lg  z-20">
          <Draggable axis="x" bounds="parent" onDrag={handleLineDrag}>
            <div
              className="h-full w-[0.3rem]  bg-[#dc8d8d] absolute z-30"
              style={{ left: `${playheadPosition * 3.33}%` }}
            >
              <div className="before:content before:absolute before:w-[1rem] before:h-4 before:bg-red-500 before:-top-2 before:-left-[0.51rem]"></div>
            </div>
          </Draggable>
          {selectedAudios.map((audio, index) => (
            <div
              key={index}
              className="flex mt-4 h-16 p-2 overflow-hidden bg-[#585858]"
            >
              <Draggable
                axis="x"
                bounds="parent"
                defaultPosition={{ x: 0, y: 0 }}
                onDrag={(e, data) => handleAudioDrag(e, data, index)}
              >
                <div
                  className={`p-2  text-white font-semibold flex_center  inline-block rounded-3xl  shadow-md`}
                  style={{
                    backgroundColor: audio.color,
                    width: `${audioRefs.current[audio.id]?.duration * 3.33}%`,
                  }}
                >
                  <audio
                    ref={(audioRef) => (audioRefs.current[audio.id] = audioRef)}
                    onEnded={() => handleAudioEnded(audio.id)}
                    playbackRate={playbackRate}
                  >
                    <source src={audio.id} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                  <div className="mt-2">
                    start: {audio.position.toFixed(0)} seconds
                  </div>
                </div>
              </Draggable>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Audio;

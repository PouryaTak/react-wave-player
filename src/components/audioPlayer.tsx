import { useEffect, useRef, useState } from "react";
import { PlayCircle, PauseCircle } from "react-feather";
import { durationToTime } from "../utils/functions";



export interface AudioPlayerProps {
    file: string;
    strokeWidth?: number;
    baseColor?: string;
    indicatorColor?: string;
  }
  
export default function AudioPlayer({
  file,
  strokeWidth = 2,
  baseColor = "#555",
  indicatorColor = "#f80"
}: AudioPlayerProps) {
  const audioContext = new AudioContext();
  const audio = useRef(new Audio(file));
  const canvas = useRef<LegacyRef<HTMLCanvasElement>>();
  const canvasIndicator = useRef<LegacyRef<HTMLCanvasElement>>();
//   const canvas = document.querySelector("canvas") as HTMLCanvasElement;
//   const canvasIndicator = document.querySelector(
//     "#indicator"
//   ) as HTMLCanvasElement;
  const initialCanvasWidth = useRef(0);
  const canvasContainer = useRef<HTMLElement>();
  const [duration, setDuration] = useState("00:00");
  const [audioTime, setAudioTime] = useState("00:00");
  const intervalId = useRef<any>();
  const [isPlaying, setIsPlaying] = useState(false);
console.log(canvas.current);

  const playAudio = () => {
    audio.current.play();
  };
  const pauseAudio = () => {
    audio.current.pause();
  };

  const renderPlaybackTime = () => {
    const currentPosition =
      (audio.current.currentTime * 100) / audio.current.duration;
    setAudioTime(durationToTime(Math.round(audio.current.currentTime)));
    canvasIndicator.current.style.setProperty("--position", currentPosition.toFixed(2));
    if (currentPosition === 100) {
      clearInterval(intervalId.current);
      setIsPlaying(false);
    }
  };

  const handlePlayback = () => {
    if (audio.current.paused) {
      playAudio();
      setIsPlaying(true);
      intervalId.current = setInterval(renderPlaybackTime, 100);
    } else {
      pauseAudio();
      clearInterval(intervalId.current);
      setIsPlaying(false);
    }
  };
  const normalizeData = (filteredData: any) => {
    const manualIncrement = 0.2;
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    return filteredData.map((n: any) => n * multiplier + manualIncrement);
  };
  const filterData = (audioBuffer: any) => {
    const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
    const samples = canvas.current?.clientWidth / 4;
    const blockSize = Math.floor(rawData.length / Math.round(samples)); // the number of samples in each subdivision
    const filteredData = [];
    for (let i = 0; i < Math.round(samples); i++) {
      const blockStart = blockSize * i; // the location of the first sample in the block
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
      }
      filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }
    return filteredData;
  };

  const draw = (normalizedData: any) => {
    // set up the canvas
    const dpr = window.devicePixelRatio;
    const padding = 20;
    canvas.current.width = canvas.current.offsetWidth * dpr;
    canvas.current.height = (canvas.current.offsetHeight + padding * 2) * dpr;
    const ctx = canvas.current.getContext("2d");
    ctx?.scale(dpr, dpr);
    ctx?.translate(0, canvas.current.offsetHeight / 2 + padding); // set Y = 0 to be in the middle of the canvas

    canvasIndicator.current.width = canvas.current.width;
    canvasIndicator.current.height = canvas.current.height;
    const clonedCtx = canvasIndicator.current.getContext("2d");
    clonedCtx?.scale(dpr, dpr);
    clonedCtx?.translate(0, canvas.current.offsetHeight / 2 + padding);

    const drawLineSegment = (
      ctx: any,
      x: number,
      height: string | number,
      width: string | number,
      isEven: boolean,
      color: string
    ) => {
      ctx.lineWidth = strokeWidth; // how thick the line is
      ctx.strokeStyle = color; // what color our line is
      ctx.beginPath();
      height = isEven ? height : -height;
      ctx.moveTo(x, -height);
      ctx.lineTo(x, height);
      ctx.stroke();
    };

    // draw the line segments
    const width = canvas.current.offsetWidth / normalizedData.length;
    for (let i = 0; i < normalizedData.length; i++) {
      const x = width * i;
      let height = normalizedData[i] * canvas.current.offsetHeight - padding;
      if (height < 0) {
        height = 0;
      } else if (height > canvas.current.offsetHeight / 2) {
        height = height - canvas.current.offsetHeight / 2;
      }
      drawLineSegment(
        ctx,
        x,
        height + 1,
        width,
        Boolean((i + 1) % 2),
        baseColor
      );
      drawLineSegment(
        clonedCtx,
        x,
        height + 1,
        width,
        Boolean((i + 1) % 2),
        indicatorColor
      );
    }
  };

  const drawAudio = (url: string) => {
    fetch(url)
      .then((response) => {
        console.log(response.arrayBuffer());
        
        return response.arrayBuffer()})
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => draw(normalizeData(filterData(audioBuffer))));
  };

  const handleSeekChange = (e:any) => {
    const selectedPosition:number = (e.offsetX * 100) / canvas.current.clientWidth
    canvasIndicator.current.style.setProperty('--position', selectedPosition.toFixed(2))
    audio.current.currentTime = ((Number(selectedPosition.toFixed(1))* audio.current.duration)/100)
    console.log(e.offsetX, canvas.current.clientWidth,selectedPosition)
}

  useEffect(() => {
    audio.current.addEventListener("canplaythrough", () => {
      setDuration(durationToTime(Math.round(audio.current?.duration)));
      drawAudio(file);
    });
    initialCanvasWidth.current= canvasContainer.current?.clientWidth as number;
    canvasIndicator.current?.style?.setProperty("--position", "0");
    canvas.current.addEventListener('mouseup', handleSeekChange)
    return ()=> {
      canvas.current.removeEventListener('mouseup', handleSeekChange)
    }
  }, []);

  return (
    <>
      {/* <audio src={url} controls/> */}
      <div className="audio_player">
        <div className="sec01 sec00">
          <button className="playControl" onClick={handlePlayback}>
            {isPlaying ? <PauseCircle size={40} /> : <PlayCircle size={40} />}
          </button>
        </div>
        <div className="sec02 sec00">
          <select name="" id="speed" defaultValue={1}>
            <option value="2">2X</option>
            <option value="1.5">1.5X</option>
            <option value="1" selected>
              1X
            </option>
            <option value="0.7">0.7X</option>
          </select>
        </div>
        <div className="sec03 sec00">{audioTime}</div>
        <div className="waves sec04 sec00" ref={canvasContainer}>
          <canvas id="base" ref={canvas}></canvas>
          <canvas id="indicator" ref={canvasIndicator}></canvas>
        </div>
        <div className="sec05 sec00">{duration}</div>
      </div>
    </>
  );
}

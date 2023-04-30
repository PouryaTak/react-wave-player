import AudioPlayer from "./components/audioPlayer";
import "./index.css";

// const file = '/david.mp3'
const file = 'https://archive.org/download/mythium/JLS_ATI.mp3'
export default function App() {
  return (
    <div className="App">
      <AudioPlayer file={file} />
    </div>
  );
}
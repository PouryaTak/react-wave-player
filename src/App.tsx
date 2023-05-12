import AudioPlayer from "./components/audioPlayer";
import "./index.css";

// const file = '/david.mp3'
// const file = 'https://archive.org/download/mythium/JLS_ATI.mp3' // !results in CORS error
const file = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/shoptalk-clip.mp3'
export default function App() {
  return (
    <div className="App">
      <AudioPlayer file={file} />
    </div>
  );
}
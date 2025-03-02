import { useState, useEffect, useRef } from "react";
import driveLogo from "./pictures/drivelogo-creativeliscense.png";
import './index.css';
import { useImageAlteration } from "./imageAlteration"; // Import the hook

function App() {
  const [image, setImage] = useState(null);
  const [timer, setTimer] = useState(0);
  const canvasRef = useRef(null);

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setImage(imgURL);
    }
  };
  useImageAlteration(image, canvasRef, timer, setTimer);

  return (
    <div>
    {!image && (
    <div className="app-container">
      <img src={driveLogo} className="drive-logo"/>
      <div className="subtitle-container">
        <h1 className="subtitle">Permenant Storage</h1>
      </div>
      <label className="upload-btn">
          Upload Image
          <input type="file" accept="image/*" onChange={handleUpload} hidden />
      </label>
    </div>)}
    {image && 
    <>
    <canvas ref={canvasRef} className="fullscreen-image"></canvas> 
    <div className="timer-container">
      {timer > -1 && <h1 className="timer">{timer}</h1>}
    </div>
    </>
    }
  </div>
  );
}

export default App;
/*
      {!image && (
        <label className="upload-btn">
          Upload Image
          <input type="file" accept="image/*" onChange={handleUpload} hidden />
        </label>
      )}
      {image && <canvas ref={canvasRef} className="fullscreen-image"></canvas>}
      <style>
        {`
        .app-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: black;
        }
        .upload-btn {
          background: white;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 18px;
        }
        .fullscreen-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        h1 {
          position: absolute;
          bottom: 8px;
          left: 620px;
          color: green;
          fontSize: timer > 100 ? "100px" : "10px",
        }
        `}
      </style>
      <h1>{timer}</h1>
    </div>
  ); */
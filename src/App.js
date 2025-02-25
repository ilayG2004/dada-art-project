import { useState, useEffect, useRef } from "react";
import cosmicSound from "./CosmicFrequency.mp3";
import waterSound from "./WaterDripping.mp3";
import mourningSound from "./MourningDove.mp3";
import blastingSound from "./TheBlastingCompany-SketchofTheUnknown.mp3";

function App() {
  const [image, setImage] = useState(null);
  const [timer, setTimer] = useState(-1);
  const canvasRef = useRef(null);
  const audioElement = useRef(new Audio(cosmicSound)); // Ref for audio to avoid re-initializing
  const birdElement = useRef(new Audio(mourningSound));
  const distortionHistory = useRef([]); // Stores distorted frames

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setImage(imgURL);
    }
  };

  useEffect(() => {
    const distortionDuration = 5000; // 5 seconds
    const interval = 50; // ms per frame
    let timerId;

    if (image) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = image;

      img.onload = () => {
        audioElement.current.play();
        audioElement.current.volume = 0.01;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let elapsed = 0;

        distortionHistory.current = []; // Clear previous distortion history

        const distort = () => {
          if (elapsed >= distortionDuration) {
            clearInterval(timerId);
            console.log("STARTING RESTORATION");
            restore();
            return;
          }

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          const frameData = new Uint8ClampedArray(pixels); // Store this frame

          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const i = (y * canvas.width + x) * 4;

              // **Distortion Calculations**
              const waveX = Math.sin(y / 20 + elapsed / 300) * 10; // Horizontal wave shift
              const waveY = Math.cos(x / 25 + elapsed / 400) * 10; // Vertical wave shift
              const staticNoise = (Math.random() - 0.5) * 100; // Noise effect

              pixels[i] += Math.sin(i / 50 + elapsed / 200) * 40 + staticNoise;
              pixels[i + 1] += Math.cos(i / 60 + elapsed / 200) * 40 - staticNoise;
              pixels[i + 2] += Math.sin(i / 70 + elapsed / 200) * 20;

              // Pixel warping
              const shiftX = Math.floor(x + waveX) % canvas.width;
              const shiftY = Math.floor(y + waveY) % canvas.height;
              const shiftedIndex = (shiftY * canvas.width + shiftX) * 4;

              pixels[i] = pixels[shiftedIndex] || pixels[i];
              pixels[i + 1] = pixels[shiftedIndex + 1] || pixels[i + 1];
              pixels[i + 2] = pixels[shiftedIndex + 2] || pixels[i + 2];
            }
          }

          ctx.putImageData(imageData, 0, 0);
          distortionHistory.current.push(frameData); // Store the distorted frame
          elapsed += interval;

          audioElement.current.volume = audioElement.current.volume + 0.001;
          const updatedTimer = Math.max(5 - Math.floor(elapsed / 1000), 0);
          if (Math.random() < 0.05) {
            birdElement.current.play();
          }
          setTimer(updatedTimer);
        };

        const restore = () => {
          let restoreFrameIndex = distortionHistory.current.length - 1;

          const restoreStep = () => {
            if (restoreFrameIndex < 0) {
              console.log("RESTORED TO ORIGINAL");
              setTimer(-1);
              audioElement.current.pause();
              return;
            }

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            imageData.data.set(distortionHistory.current[restoreFrameIndex]);
            ctx.putImageData(imageData, 0, 0);

            restoreFrameIndex--; // Move back through recorded distortions
            audioElement.current.volume = audioElement.current.volume - 0.0001;
            setTimer(Math.random() * 1000);
            setTimeout(restoreStep, interval);
          };

          restoreStep();
        };

        console.log("STARTING DISTORTION");
        timerId = setInterval(distort, interval);
      };
    }

    return () => clearInterval(timerId); // Cleanup on unmount
  }, [image]);

  return (
    <div className="app-container">
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
  );
}

export default App;

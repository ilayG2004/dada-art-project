import { useState, useEffect, useRef } from "react";
import cosmicSound from "./sounds/CosmicFrequency.mp3";
import mourningSound from "./sounds/MourningDove.mp3";
import waterSound from "./sounds/WaterDripping.mp3";
import windChimes from "./sounds/WindChimesSoundEffect.mp3";

export function useImageAlteration(image, canvasRef, timer, setTimer) {
  const audioElement = useRef(new Audio(cosmicSound));
  const birdElement = useRef(new Audio(mourningSound));
  const waterElement = useRef(new Audio(waterSound));
  const windElement = useRef(new Audio(windChimes));

  const distortionHistory = useRef([]);

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const distortionDuration = 30000; // 5 seconds
    const interval = 50;
    let timerId;

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

      let elapsed = 0;
      distortionHistory.current = [];

      const distort = () => {
        if (elapsed >= distortionDuration) {
          clearInterval(timerId);
          restore();
          return;
        }

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const frameData = new Uint8ClampedArray(pixels);

        for (let i = 0; i < pixels.length; i += 4) {
          const staticNoise = (Math.random() - 0.5) * 100;
          pixels[i] += staticNoise;
          pixels[i + 1] -= staticNoise;
          pixels[i + 2] += Math.sin(i / 70 + elapsed / 200) * 20;
        }

        ctx.putImageData(imageData, 0, 0);
        distortionHistory.current.push(frameData);
        elapsed += interval;

        audioElement.current.volume += 0.001;
        if (Math.random() < 0.1) {
          setTimer(Math.max(30 - Math.floor(elapsed / 1000), 0) + (Math.random()*1000));
        } else {
          setTimer(Math.max(30 - Math.floor(elapsed / 1000), 0));
        }
        
      };

      const restore = () => {
        let restoreFrameIndex = distortionHistory.current.length - 1;

        const restoreStep = () => {
          if (restoreFrameIndex < 0) {
            setTimer(-1);
            audioElement.current.pause();
            return;
          }

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          imageData.data.set(distortionHistory.current[restoreFrameIndex]);
          ctx.putImageData(imageData, 0, 0);

          setTimer((Math.random()*1000) + (Math.random()*3000));

          if (Math.random() < 0.05) birdElement.current.play();
          //if (Math.random() < 0.05) waterElement.current.play();
          if (Math.random() < 0.05) windElement.current.play();
          restoreFrameIndex--;
          setTimeout(restoreStep, interval);
        };

        restoreStep();
      };

      timerId = setInterval(distort, interval);
    };

    return () => clearInterval(timerId);
  }, [image, canvasRef, setTimer]);
}


import { useEffect, useState, useRef } from 'react';

export const useHandGestures = (onGesture: (isOpen: boolean) => void, onMove: (pos: { x: number, y: number }) => void) => {
  const [active, setActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const initTracking = async () => {
      videoRef.current = document.getElementById('gesture-video') as HTMLVideoElement;
      
      // Check if scripts are loaded from CDN
      if (!(window as any).Hands || !(window as any).Camera || !videoRef.current) {
        console.warn("Mediapipe scripts or video element not ready. Retrying...");
        setTimeout(initTracking, 500);
        return;
      }

      const hands = new (window as any).Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
      });

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          
          // Heuristic for open vs closed hand
          const tips = [8, 12, 16, 20];
          const palmBase = landmarks[0];
          
          let openCount = 0;
          tips.forEach(tipIdx => {
            const tip = landmarks[tipIdx];
            const dist = Math.sqrt(Math.pow(tip.x - palmBase.x, 2) + Math.pow(tip.y - palmBase.y, 2));
            if (dist > 0.15) openCount++;
          });

          const isOpen = openCount >= 3;
          onGesture(isOpen);

          const center = landmarks[9];
          onMove({ x: (center.x - 0.5) * 2, y: (center.y - 0.5) * 2 });
        }
      });

      try {
        const camera = new (window as any).Camera(videoRef.current, {
          onFrame: async () => {
            await hands.send({ image: videoRef.current! });
          },
          width: 640,
          height: 480
        });

        await camera.start();
        setActive(true);
        if (videoRef.current) videoRef.current.style.display = 'block';
      } catch (err) {
        console.error("Camera initialization failed:", err);
      }
    };

    initTracking();

    return () => {
      // Cleanup logic could be added here if Mediapipe instances are stored in refs
    };
  }, [onGesture, onMove]);

  return active;
};

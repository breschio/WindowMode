'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type Pt = { x: number; y: number };
type Iris = { center: Pt; edges: Pt[] };

const DEFAULT_HFOV_DEG = 60;
const RIGHT_IRIS_IDX = 468;
const LEFT_IRIS_IDX = 473;

interface CameraTrackingResult {
  eyePosition: [number, number, number] | null;
  numFramesFaceHidden: number;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function useCameraTracking(isPortrait: boolean): CameraTrackingResult {
  const [numFramesFaceHidden, setNumFramesFaceHidden] = useState(0);
  const [eyePosition, setEyePosition] = useState<[number, number, number] | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const irisDistRightRef = useRef<number | null>(null);
  const irisDistLeftRef = useRef<number | null>(null);
  const isPortraitRef = useRef(isPortrait);
  const numFramesFaceHiddenRef = useRef(numFramesFaceHidden);

  useEffect(() => {
    isPortraitRef.current = isPortrait;
  }, [isPortrait]);

  useEffect(() => {
    numFramesFaceHiddenRef.current = numFramesFaceHidden;
  }, [numFramesFaceHidden]);

  const focalLengthPixels = useCallback((imageWidthPx: number, hFovDeg: number) => {
    const a = (hFovDeg * Math.PI) / 180;
    return imageWidthPx / (2 * Math.tan(a / 2));
  }, []);

  useEffect(() => {
    let running = true;
    let worker: Worker;
    let initialized = false;

    async function init() {
      if (initialized) return;
      initialized = true;

      try {
        if (!running) return; // Check if component unmounted before we started

        // List available cameras for debugging
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Available cameras:', videoDevices.map(d => ({ label: d.label, id: d.deviceId })));

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 160 },
            height: { ideal: 120 }
          },
          audio: false
        });

        console.log('Camera stream obtained:', {
          active: stream.active,
          tracks: stream.getTracks().map(t => ({
            kind: t.kind,
            label: t.label,
            enabled: t.enabled,
            muted: t.muted,
            readyState: t.readyState
          }))
        });

        if (!running) {
          // Component unmounted while getting media, stop tracks
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) {
          console.error('Video element not found');
          return;
        }
        video.srcObject = stream;

        console.log('Video element configured:', {
          srcObject: !!video.srcObject,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          readyState: video.readyState
        });

        // Wait for video to be ready before playing
        await new Promise<void>((resolve) => {
          const onLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            resolve();
          };
          video.addEventListener('loadedmetadata', onLoadedMetadata);
          // Fallback in case event already fired
          if (video.readyState >= 1) {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            resolve();
          }
        });

        // Handle video play with proper error handling
        try {
          if (!running) return; // Check before playing
          await video.play();
          console.log('Video playing successfully:', {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            paused: video.paused,
            currentTime: video.currentTime
          });
        } catch (err: any) {
          // Ignore AbortError - it happens when the component unmounts during initialization
          if (err.name !== 'AbortError') {
            console.error('Video play error:', err);
          }
          return; // Don't continue if play failed
        }

        if (!running) return; // Check before creating worker

        worker = new Worker(new URL('../../components/LandmarkWorker.tsx', import.meta.url), {
          type: 'module'
        });

        worker.postMessage({
          type: 'init',
          payload: {
            wasmPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
            modelPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
          }
        });

        let lastTime = -1;
        let landmarkingReady = false;
        let landmarkingInFlight = false;
        let lastVideoTime = -1;
        let latestLandmarks: any[] | null = null;

        worker.onmessage = (e) => {
          if (e.data.type === 'landmarks') {
            latestLandmarks = e.data.payload?.[0] ?? null;
            landmarkingInFlight = false;

            if (latestLandmarks)
              setNumFramesFaceHidden(0);
            else
              setNumFramesFaceHidden(numFramesFaceHiddenRef.current + 1);
          }

          if (e.data.type === 'ready')
            landmarkingReady = true;
        };

        function extractIris(landmarks: any[], idx: number): Iris {
          let edges = [];
          for (let i = 0; i < 4; i++) {
            let landmark = landmarks[idx + 1 + i];
            edges.push({ x: landmark.x, y: landmark.y });
          }

          return {
            center: { x: landmarks[idx].x, y: landmarks[idx].y },
            edges
          };
        }

        function irisDistance(iris: Iris, hFovDeg = DEFAULT_HFOV_DEG): number {
          const IRIS_DIAMETER_MM = 11.7;

          let dx = ((iris.edges[0].x - iris.edges[2].x) + (iris.edges[1].x - iris.edges[3].x))
            / 2.0 * video.videoWidth;
          let dy = ((iris.edges[0].y - iris.edges[2].y) + (iris.edges[1].y - iris.edges[3].y))
            / 2.0 * video.videoHeight;

          let irisSize = Math.sqrt(dx * dx + dy * dy);
          const fpx = focalLengthPixels(video.videoWidth, hFovDeg);
          const irisDiamCm = IRIS_DIAMETER_MM / 10;

          return (fpx * irisDiamCm) / irisSize;
        }

        function irisPosition(iris: Iris, distanceCm: number, hFovDeg = DEFAULT_HFOV_DEG): { x: number; y: number; z: number } {
          const W = video.videoWidth;
          const H = video.videoHeight;
          const fpx = focalLengthPixels(W, hFovDeg);

          const u = iris.center.x;
          const v = iris.center.y;

          const x = -(u * W - W / 2) * distanceCm / fpx;
          const y = -(v * H - H / 2) * distanceCm / fpx;
          const z = distanceCm;

          return { x, y, z };
        }

        function loop() {
          if (!running) return;

          const currentTime = performance.now();
          const dt = currentTime - lastTime;
          lastTime = currentTime;

          if (landmarkingReady && !landmarkingInFlight && video.currentTime !== lastVideoTime) {
            const videoTimestamp = Math.round(video.currentTime * 1000);
            createImageBitmap(video).then((bitmap) => {
              worker.postMessage({ type: 'frame', payload: { bitmap, timestamp: videoTimestamp } }, [bitmap]);
            });

            landmarkingInFlight = true;
            lastVideoTime = video.currentTime;
          }

          if (latestLandmarks) {
            const irisRight = extractIris(latestLandmarks, RIGHT_IRIS_IDX);
            const irisLeft = extractIris(latestLandmarks, LEFT_IRIS_IDX);

            const irisTargetDistRight = irisDistance(irisRight);
            const irisTargetDistLeft = irisDistance(irisLeft);

            var irisDistRight = irisDistRightRef.current;
            var irisDistLeft = irisDistLeftRef.current;

            const distanceDecay = 1.0 - Math.pow(0.99, dt);

            irisDistRight = irisDistRight != null
              ? irisDistRight + (irisTargetDistRight - irisDistRight) * distanceDecay
              : irisTargetDistRight;

            irisDistLeft = irisDistLeft != null
              ? irisDistLeft + (irisTargetDistLeft - irisDistLeft) * distanceDecay
              : irisTargetDistLeft;

            irisDistRightRef.current = irisDistRight;
            irisDistLeftRef.current = irisDistLeft;

            const minDist = Math.min(irisDistLeft, irisDistRight);

            let irisPosRight = irisPosition(irisRight, minDist);
            let irisPosLeft = irisPosition(irisLeft, minDist);

            let avgPos: [number, number, number] = [
              (irisPosRight.x + irisPosLeft.x) / 2.0,
              (irisPosRight.y + irisPosLeft.y) / 2.0,
              (irisPosRight.z + irisPosLeft.z) / 2.0
            ];

            avgPos[1] -= isPortraitRef.current ? 30.0 : 20.0;

            setEyePosition(avgPos);
          }

          requestAnimationFrame(loop);
        }

        requestAnimationFrame(loop);
      } catch (e: any) {
        console.error('Camera tracking initialization failed:', e);
      }
    }

    // Wait for video element to be mounted before initializing
    if (videoRef.current) {
      init();
    } else {
      // Video element not ready yet, schedule a check
      const checkInterval = setInterval(() => {
        if (videoRef.current) {
          clearInterval(checkInterval);
          init();
        }
      }, 100);

      return () => {
        clearInterval(checkInterval);
        running = false;
        worker?.terminate();
        const v = videoRef.current;
        const stream = v && (v.srcObject as MediaStream);
        stream?.getTracks()?.forEach(t => t.stop());
      };
    }

    return () => {
      running = false;
      worker?.terminate();
      const v = videoRef.current;
      const stream = v && (v.srcObject as MediaStream);
      stream?.getTracks()?.forEach(t => t.stop());
    };
  }, [focalLengthPixels]);

  return {
    eyePosition,
    numFramesFaceHidden,
    videoRef
  };
}

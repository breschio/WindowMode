'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface GLBPlayerProps {
  src: string;
  eyePosition: [number, number, number] | null;
  style?: React.CSSProperties;
  depthLayer?: number; // 0=background, 1=midground, 2=foreground
}

// Depth layer configuration (same as layer-manager.ts)
const LAYER_CONFIG = {
  0: { zOffset: -0.8, scale: 1.2 }, // Background
  1: { zOffset: 0.0, scale: 1.0 },  // Midground
  2: { zOffset: 0.6, scale: 0.8 }   // Foreground
};

export function GLBPlayer({ src, eyePosition, style, depthLayer = 1 }: GLBPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent for layering
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    // Load GLB model
    const loader = new GLTFLoader();
    console.log('Loading GLB model:', src);

    loader.load(
      src,
      (gltf) => {
        console.log('GLB model loaded successfully:', src);
        const model = gltf.scene;

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;

        model.position.sub(center);
        model.scale.multiplyScalar(scale);

        // Apply depth layer scaling
        const layerConfig = LAYER_CONFIG[depthLayer as keyof typeof LAYER_CONFIG] || LAYER_CONFIG[1];
        model.scale.multiplyScalar(layerConfig.scale);

        scene.add(model);
        modelRef.current = model;
      },
      (progress) => {
        if (progress.lengthComputable) {
          const percentComplete = (progress.loaded / progress.total) * 100;
          console.log(`Loading ${src}: ${percentComplete.toFixed(1)}%`);
        }
      },
      (error) => {
        console.error('Error loading GLB model:', src, error);
      }
    );

    // Animation loop
    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [src, depthLayer]);

  // Update camera position based on eye tracking
  useEffect(() => {
    if (!cameraRef.current || !eyePosition) return;

    const camera = cameraRef.current;
    const [x, y, z] = eyePosition;

    // Apply depth layer offset
    const layerConfig = LAYER_CONFIG[depthLayer as keyof typeof LAYER_CONFIG] || LAYER_CONFIG[1];

    // Convert eye position (in cm) to camera position
    // Scale factor to convert from real-world cm to scene units
    const positionScale = 0.02;

    // Apply parallax effect with depth layer offset
    camera.position.x = x * positionScale;
    camera.position.y = -y * positionScale;
    camera.position.z = 5 + (z * positionScale * 0.5) + layerConfig.zOffset;

    // Look at center
    camera.lookAt(0, 0, 0);
  }, [eyePosition, depthLayer]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        ...style
      }}
    />
  );
}

'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GridOverlayProps {
  eyePosition: [number, number, number] | null;
  style?: React.CSSProperties;
  visible?: boolean;
}

export function GridOverlay({ eyePosition, style, visible = true }: GridOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Three.js scene with grid
  useEffect(() => {
    if (!containerRef.current || !visible) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null;
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

    // Create perspective wireframe grid (like original WindowMode)
    // Only floor and side walls - no back wall or ceiling to avoid obscuring objects
    const gridSize = 40;
    const divisions = 40;
    const gridColor = 0x444444;

    // Floor grid
    const floorGrid = new THREE.GridHelper(gridSize, divisions, gridColor, gridColor);
    floorGrid.position.y = -5;
    scene.add(floorGrid);

    // Left wall grid
    const leftWallGrid = new THREE.GridHelper(gridSize, divisions, gridColor, gridColor);
    leftWallGrid.rotation.z = Math.PI / 2;
    leftWallGrid.position.x = -20;
    scene.add(leftWallGrid);

    // Right wall grid
    const rightWallGrid = new THREE.GridHelper(gridSize, divisions, gridColor, gridColor);
    rightWallGrid.rotation.z = Math.PI / 2;
    rightWallGrid.position.x = 20;
    scene.add(rightWallGrid);

    gridRef.current = floorGrid;

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
  }, [visible]);

  // Update camera position based on eye tracking
  useEffect(() => {
    if (!cameraRef.current || !eyePosition) return;

    const camera = cameraRef.current;
    const [x, y, z] = eyePosition;

    // Convert eye position to camera position
    const positionScale = 0.02;

    camera.position.x = x * positionScale;
    camera.position.y = -y * positionScale;
    camera.position.z = 5 + (z * positionScale * 0.5);

    camera.lookAt(0, 0, 0);
  }, [eyePosition]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...style
      }}
    />
  );
}

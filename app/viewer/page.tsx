'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ViewerPage() {
  const searchParams = useSearchParams();
  const modelUrl = searchParams.get('model') || '/dioramas/45974155-a17a-48f8-9d03-d132d2be8131.glb';
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let scene: any, camera: any, renderer: any, controls: any, animationId: number;

    async function init() {
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

        if (!containerRef.current) return;

        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a);

        // Camera
        camera = new THREE.PerspectiveCamera(
          75,
          containerRef.current.clientWidth / containerRef.current.clientHeight,
          0.1,
          1000
        );
        camera.position.z = 5;

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        containerRef.current.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-5, -5, -5);
        scene.add(directionalLight2);

        // Controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2;

        // Load GLB model
        const loader = new GLTFLoader();
        loader.load(
          modelUrl,
          (gltf) => {
            const model = gltf.scene;

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;

            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));

            scene.add(model);
            setLoading(false);
          },
          (progress) => {
            console.log('Loading:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
          },
          (error) => {
            console.error('Error loading model:', error);
            setError('Failed to load 3D model');
            setLoading(false);
          }
        );

        // Animation loop
        function animate() {
          animationId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        }
        animate();

        // Handle resize
        const handleResize = () => {
          if (!containerRef.current) return;
          camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(animationId);
          renderer.dispose();
        };
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize 3D viewer');
        setLoading(false);
      }
    }

    init();
  }, [modelUrl]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">3D Model Viewer</h1>
            <p className="text-gray-400 text-sm mt-1">{modelUrl}</p>
          </div>
          <a
            href="/browse"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Browse
          </a>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className="absolute inset-0"
        />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading 3D model...</p>
              <p className="text-gray-400 text-sm mt-2">This may take a moment for large files</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center max-w-md px-6">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-white text-2xl font-bold mb-2">Error</h2>
              <p className="text-gray-400">{error}</p>
            </div>
          </div>
        )}

        {/* Controls info */}
        {!loading && !error && (
          <div className="absolute bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg backdrop-blur-sm border border-white/20">
            <h3 className="font-semibold mb-2">Controls:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Left click + drag to rotate</li>
              <li>• Right click + drag to pan</li>
              <li>• Scroll to zoom</li>
              <li>• Auto-rotation enabled</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}


import React, { Suspense, useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Tree, TreeState } from './components/Tree';
import { UIOverlay } from './components/UIOverlay';
import { PostProcessing } from './components/PostProcessing';
import { useHandGestures } from './hooks/useHandGestures';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);
  const [handOffset, setHandOffset] = useState({ x: 0, y: 0 });
  const controlsRef = useRef<any>(null);

  const onGesture = useCallback((isOpen: boolean) => {
    // Open palm = Unleash (Chaos), Closed fist = Reassemble (Tree)
    setTreeState(isOpen ? TreeState.SCATTERED : TreeState.TREE_SHAPE);
  }, []);

  const onMove = useCallback((pos: { x: number, y: number }) => {
    // Mirror movement to adjust camera slightly
    setHandOffset({ x: pos.x * 5, y: -pos.y * 3 });
  }, []);

  const gestureActive = useHandGestures(onGesture, onMove);

  const handleStartThinking = useCallback(() => setTreeState(TreeState.SCATTERED), []);
  const handleFinishThinking = useCallback(() => setTreeState(TreeState.TREE_SHAPE), []);

  return (
    <div className="w-full h-screen bg-[#010805]">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[handOffset.x, 3 + handOffset.y, 22]} fov={45} />
        <OrbitControls 
          ref={controlsRef}
          enablePan={false} 
          minDistance={12} 
          maxDistance={35} 
          autoRotate={treeState === TreeState.TREE_SHAPE} 
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.75}
        />

        <Suspense fallback={null}>
          <Environment preset="night" blur={0.8} />
          
          <group position={[0, -2.5, 0]}>
            <Tree state={treeState} />
          </group>

          <ContactShadows 
            opacity={0.5} 
            scale={28} 
            blur={3.5} 
            far={10} 
            resolution={512} 
            color="#000000" 
            position={[0, -6.8, 0]}
          />

          <ambientLight intensity={0.6} />
          <spotLight position={[25, 30, 20]} angle={0.3} penumbra={1} intensity={5} color="#D4AF37" />
          <pointLight position={[-20, 15, 10]} intensity={3} color="#991b1b" />
          
          <PostProcessing />
        </Suspense>
      </Canvas>

      <UIOverlay 
        onStartThinking={handleStartThinking} 
        onFinishThinking={handleFinishThinking}
        gestureActive={gestureActive}
        treeState={treeState}
      />

      <div className="fixed inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.9)_100%)] pointer-events-none" />
    </div>
  );
};

export default App;


import React from 'react';
import { Bloom, EffectComposer, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';

export const PostProcessing: React.FC = () => {
  return (
    <EffectComposer disableNormalPass>
      <Bloom 
        intensity={1.8} 
        luminanceThreshold={0.25} 
        luminanceSmoothing={0.8} 
        mipmapBlur 
      />
      <ChromaticAberration offset={[0.001, 0.001]} />
      <Noise opacity={0.05} />
      <Vignette eskil={false} offset={0.05} darkness={1.3} />
    </EffectComposer>
  );
};

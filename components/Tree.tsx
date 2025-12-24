
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Sparkles } from '@react-three/drei';

export enum TreeState {
  SCATTERED,
  TREE_SHAPE
}

interface TreeProps {
  state: TreeState;
}

const FOLIAGE_COUNT = 9500; 
const ORNAMENT_GOLD_COUNT = 250;
const ORNAMENT_RUBY_COUNT = 220;
const POLAROID_COUNT = 80; // New: Polaroid style photos
const CHOCOLATE_COUNT = 150;
const DEER_COUNT = 50;
const GIFT_COUNT = 120;
const LIGHT_COUNT = 200;
const SNOW_COUNT = 450; 
const CRYSTAL_COUNT = 250; 
const STRIPE_COUNT = 550;  

const randomInSphere = (radius: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(Math.random());
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const Tree: React.FC<TreeProps> = ({ state }) => {
  const foliageRef = useRef<THREE.Points>(null);
  const goldOrnRef = useRef<THREE.InstancedMesh>(null);
  const rubyOrnRef = useRef<THREE.InstancedMesh>(null);
  const polaroidRef = useRef<THREE.InstancedMesh>(null);
  const chocRef = useRef<THREE.InstancedMesh>(null);
  const deerRef = useRef<THREE.InstancedMesh>(null);
  const giftRef = useRef<THREE.InstancedMesh>(null);
  const lightRef = useRef<THREE.InstancedMesh>(null);
  const snowRef = useRef<THREE.InstancedMesh>(null);
  const crystalRef = useRef<THREE.InstancedMesh>(null);
  const stripeRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.Group>(null);
  
  const morphTarget = useRef(0);
  const currentMorph = useRef(0);

  useEffect(() => {
    morphTarget.current = state === TreeState.TREE_SHAPE ? 1 : 0;
  }, [state]);

  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outer = 1.5;
    const inner = 0.6;
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? outer : inner;
      if (i === 0) shape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
      else shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    return new THREE.ExtrudeGeometry(shape, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1 });
  }, []);

  const data = useMemo(() => {
    const foliage = { positions: new Float32Array(FOLIAGE_COUNT * 3), scatter: new Float32Array(FOLIAGE_COUNT * 3) };
    const layers = {
      goldOrns: [] as any[], rubyOrns: [] as any[], chocolates: [] as any[], deers: [] as any[],
      gifts: [] as any[], lights: [] as any[], crystals: [] as any[], stripes: [] as any[], 
      snow: [] as any[], polaroids: [] as any[]
    };

    const getTreeSurfacePos = (t: number, radiusOffset = 0) => {
      const angle = Math.random() * Math.PI * 2;
      const r = (1 - t) * (5.2 + radiusOffset);
      return new THREE.Vector3(Math.cos(angle) * r, t * 15 - 6, Math.sin(angle) * r);
    };

    // Main foliage
    for (let i = 0; i < FOLIAGE_COUNT; i++) {
      const t = Math.random();
      const radius = (1 - t) * 5.2;
      const tx = Math.cos(t * 120) * radius;
      const tz = Math.sin(t * 120) * radius;
      const scatter = randomInSphere(16);
      foliage.positions.set([tx, t * 15 - 6, tz], i * 3);
      foliage.scatter.set([scatter.x, scatter.y, scatter.z], i * 3);
    }

    const config = [
      { key: 'goldOrns', count: ORNAMENT_GOLD_COUNT, weight: 0.6, scale: 0.1, drift: 18 },
      { key: 'rubyOrns', count: ORNAMENT_RUBY_COUNT, weight: 0.7, scale: 0.12, drift: 20 },
      { key: 'snow', count: SNOW_COUNT, weight: 1.4, scale: 0.08, drift: 25 },
      { key: 'chocolates', count: CHOCOLATE_COUNT, weight: 0.4, scale: 0.15, drift: 14 },
      { key: 'deers', count: DEER_COUNT, weight: 1.1, scale: 0.25, drift: 22 },
      { key: 'lights', count: LIGHT_COUNT, weight: 1.6, scale: 0.06, drift: 28 },
      { key: 'crystals', count: CRYSTAL_COUNT, weight: 0.9, scale: 0.15, drift: 19 },
      { key: 'polaroids', count: POLAROID_COUNT, weight: 0.5, scale: 0.4, drift: 16 } // Polaroid weight
    ];

    config.forEach(cfg => {
      for (let i = 0; i < cfg.count; i++) {
        const t = Math.random();
        (layers as any)[cfg.key].push({
          tree: getTreeSurfacePos(t, 0.15),
          scatter: randomInSphere(cfg.drift),
          weight: cfg.weight,
          scale: cfg.scale * (0.9 + Math.random() * 0.3),
          rot: new THREE.Euler(Math.random() * 0.4, Math.random() * Math.PI, 0)
        });
      }
    });

    for (let i = 0; i < GIFT_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      layers.gifts.push({
        tree: new THREE.Vector3(Math.cos(angle) * (1.5 + Math.random()*5), -5.8 + Math.random()*2, Math.sin(angle) * (1.5 + Math.random()*5)),
        scatter: randomInSphere(10), weight: 0.2, scale: 0.4 + Math.random()*0.4
      });
    }

    return { foliage, ...layers };
  }, []);

  const tempObj = new THREE.Object3D();

  useFrame((clockState) => {
    const t = clockState.clock.getElapsedTime();
    currentMorph.current = THREE.MathUtils.lerp(currentMorph.current, morphTarget.current, 0.035);
    const m = currentMorph.current;
    const invM = 1 - m;

    if (foliageRef.current) {
      const positions = foliageRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < FOLIAGE_COUNT; i++) {
        const i3 = i * 3;
        positions[i3] = THREE.MathUtils.lerp(data.foliage.scatter[i3], data.foliage.positions[i3], m) + Math.sin(t * 0.5 + i) * invM * 4;
        positions[i3+1] = THREE.MathUtils.lerp(data.foliage.scatter[i3+1], data.foliage.positions[i3+1], m) + Math.cos(t * 0.4 + i) * invM * 3;
        positions[i3+2] = THREE.MathUtils.lerp(data.foliage.scatter[i3+2], data.foliage.positions[i3+2], m) + Math.sin(t * 0.6 + i) * invM * 4;
      }
      foliageRef.current.geometry.attributes.position.needsUpdate = true;
    }

    const updateLayer = (ref: React.RefObject<THREE.InstancedMesh>, items: any[]) => {
      if (!ref.current) return;
      items.forEach((item, i) => {
        const drift = item.weight * invM * 9;
        const pos = new THREE.Vector3().lerpVectors(item.scatter, item.tree, m);
        pos.x += Math.sin(t * (0.4 + item.weight) + i) * drift;
        pos.y += Math.cos(t * (0.3 + item.weight) + i) * drift;
        pos.z += Math.sin(t * (0.5 + item.weight) + i) * drift;

        tempObj.position.copy(pos);
        if (item.rot) tempObj.rotation.copy(item.rot);
        if (m < 0.95) tempObj.rotation.y += t * item.weight * 0.6;
        tempObj.scale.setScalar(item.scale);
        tempObj.updateMatrix();
        ref.current!.setMatrixAt(i, tempObj.matrix);
      });
      ref.current.instanceMatrix.needsUpdate = true;
    };

    updateLayer(goldOrnRef, data.goldOrns);
    updateLayer(rubyOrnRef, data.rubyOrns);
    updateLayer(polaroidRef, data.polaroids);
    updateLayer(chocRef, data.chocolates);
    updateLayer(deerRef, data.deers);
    updateLayer(giftRef, data.gifts);
    updateLayer(lightRef, data.lights);
    updateLayer(snowRef, data.snow);
    updateLayer(crystalRef, data.crystals);

    if (starRef.current) {
      starRef.current.scale.setScalar(m);
      starRef.current.position.y = THREE.MathUtils.lerp(22, 9.5, m);
      starRef.current.rotation.z = t * 0.5;
    }
  });

  return (
    <group>
      <points ref={foliageRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={FOLIAGE_COUNT} array={data.foliage.positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.2} color="#043927" transparent opacity={0.9} />
      </points>

      {/* Ornaments */}
      <instancedMesh ref={goldOrnRef} args={[null as any, null as any, ORNAMENT_GOLD_COUNT]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhysicalMaterial color="#D4AF37" metalness={1} roughness={0.1} clearcoat={1} />
      </instancedMesh>

      <instancedMesh ref={rubyOrnRef} args={[null as any, null as any, ORNAMENT_RUBY_COUNT]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhysicalMaterial color="#b91c1c" metalness={0.9} roughness={0.05} clearcoat={1} />
      </instancedMesh>

      {/* Polaroids - New white photo ornaments */}
      <instancedMesh ref={polaroidRef} args={[null as any, null as any, POLAROID_COUNT]}>
        <boxGeometry args={[0.8, 1, 0.05]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.2} metalness={0} clearcoat={1} />
      </instancedMesh>

      <instancedMesh ref={chocRef} args={[null as any, null as any, CHOCOLATE_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#3f2314" roughness={0.8} />
      </instancedMesh>

      <instancedMesh ref={snowRef} args={[null as any, null as any, SNOW_COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshPhysicalMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </instancedMesh>

      <instancedMesh ref={lightRef} args={[null as any, null as any, LIGHT_COUNT]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#FFF" emissive="#FFD700" emissiveIntensity={6} />
      </instancedMesh>

      <group ref={starRef}>
        <Float speed={5} rotationIntensity={1} floatIntensity={1}>
          <mesh geometry={starGeometry} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#FFD700" emissive="#D4AF37" emissiveIntensity={10} metalness={1} />
          </mesh>
        </Float>
      </group>

      <Sparkles count={500} scale={25} size={5} speed={0.8} color="#FFD700" opacity={0.8} />
    </group>
  );
};

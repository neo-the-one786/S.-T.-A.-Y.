/* eslint-disable react-hooks/purity, react-hooks/refs */
import { useRef, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Generate star data once (outside render) ─── */
function generateStars(count: number) {
  const pos = new Float32Array(count * 3);
  const sz = new Float32Array(count);
  const op = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 50;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    sz[i] = Math.random() * 2.5 + 0.3;
    op[i] = Math.random() * 0.7 + 0.3;
  }
  return { positions: pos, sizes: sz, opacities: op };
}

/* ─── Star Points ─── */
function Stars({ count = 600 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });
  const starData = useRef<ReturnType<typeof generateStars> | null>(null);
  if (!starData.current) starData.current = generateStars(count);
  const { positions, sizes, opacities } = starData.current;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const lerp = 1 - Math.pow(0.05, delta);
    smoothMouse.current.x += (mouseRef.current.x - smoothMouse.current.x) * lerp;
    smoothMouse.current.y += (mouseRef.current.y - smoothMouse.current.y) * lerp;
    meshRef.current.position.x = smoothMouse.current.x * 0.5;
    meshRef.current.position.y = -smoothMouse.current.y * 0.3;

    // Twinkle
    const geo = meshRef.current.geometry;
    const sizeAttr = geo.getAttribute('size') as THREE.BufferAttribute;
    const time = performance.now() * 0.001;
    for (let i = 0; i < count; i++) {
      const baseSize = sizes[i];
      const twinkle = Math.sin(time * (0.5 + opacities[i] * 2) + i * 7.3) * 0.3 + 0.7;
      sizeAttr.setX(i, baseSize * twinkle);
    }
    sizeAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uColor: { value: new THREE.Color('#f0ead6') },
          uGoldColor: { value: new THREE.Color('#c9a84c') },
        }}
        vertexShader={`
          attribute float size;
          varying float vSize;
          void main() {
            vSize = size;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (200.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform vec3 uGoldColor;
          varying float vSize;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = smoothstep(0.5, 0.0, dist);
            vec3 color = mix(uColor, uGoldColor, smoothstep(1.5, 3.0, vSize));
            // Cross gleam for bright stars
            float gleam = 0.0;
            if (vSize > 2.0) {
              float gx = smoothstep(0.15, 0.0, abs(gl_PointCoord.y - 0.5));
              float gy = smoothstep(0.15, 0.0, abs(gl_PointCoord.x - 0.5));
              gleam = (gx + gy) * 0.3;
            }
            gl_FragColor = vec4(color, (alpha + gleam) * 0.85);
          }
        `}
      />
    </points>
  );
}

/* ─── Shooting Star ─── */
function ShootingStar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const lifeRef = useRef<{ active: boolean; timer: number; nextSpawn: number } | null>(null);
  if (!lifeRef.current) lifeRef.current = { active: false, timer: 0, nextSpawn: Math.random() * 5 + 2 };

  const startPos = useRef(new THREE.Vector3());
  const velocity = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const life = lifeRef.current;
    if (!meshRef.current || !life) return;

    if (!life.active) {
      life.timer += delta;
      meshRef.current.visible = false;
      if (life.timer > life.nextSpawn) {
        // Spawn
        life.active = true;
        life.timer = 0;
        life.nextSpawn = Math.random() * 8 + 4;
        startPos.current.set(
          (Math.random() - 0.5) * 30,
          Math.random() * 10 + 5,
          -3
        );
        const angle = Math.PI * 0.6 + Math.random() * 0.4;
        const speed = 12 + Math.random() * 8;
        velocity.current.set(Math.cos(angle) * speed, Math.sin(angle) * speed * -1, 0);
        meshRef.current.position.copy(startPos.current);
        meshRef.current.visible = true;

        const dir = velocity.current.clone().normalize();
        const angleZ = Math.atan2(dir.y, dir.x);
        meshRef.current.rotation.z = angleZ;
      }
      return;
    }

    life.timer += delta;
    meshRef.current.position.x += velocity.current.x * delta;
    meshRef.current.position.y += velocity.current.y * delta;

    const progress = life.timer / 1.2;
    const opacity = progress < 0.2 ? progress / 0.2 : Math.max(0, 1 - (progress - 0.2) / 0.8);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = opacity * 0.8;

    if (life.timer > 1.2) {
      life.active = false;
      life.timer = 0;
      meshRef.current.visible = false;
    }
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <planeGeometry args={[2.5, 0.015]} />
      <meshBasicMaterial
        color="#e8d48b"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ─── Scene wrapper ─── */
function Scene() {
  const { gl } = useThree();
  useEffect(() => {
    gl.setClearColor('#040610', 1);
  }, [gl]);

  return (
    <>
      <Stars count={500} />
      <ShootingStar />
      <ShootingStar />
      <ShootingStar />
    </>
  );
}

/* ─── Exported component ─── */
export default function Starfield() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: false }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

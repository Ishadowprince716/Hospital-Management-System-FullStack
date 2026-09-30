import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface GlobeProps {
  className?: string;
  size?: number;
}

export const WireframeGlobe: React.FC<GlobeProps> = ({ className = '', size = 520 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || size;
    let height = container.clientHeight || size;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const radius = 80;

    // 1. Dotted Globe Particles (Fibonacci Sphere Distribution)
    const dotCount = 1200;
    const dotPositions = new Float32Array(dotCount * 3);
    const dotSizes = new Float32Array(dotCount);
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    for (let i = 0; i < dotCount; i++) {
      const y = 1 - (i / (dotCount - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      dotPositions[i * 3] = x * radius;
      dotPositions[i * 3 + 1] = y * radius;
      dotPositions[i * 3 + 2] = z * radius;

      // Slight size variation for depth shimmer
      dotSizes[i] = Math.random() > 0.85 ? 2.4 : 1.4;
    }

    const dotGeometry = new THREE.BufferGeometry();
    dotGeometry.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    dotGeometry.setAttribute('size', new THREE.BufferAttribute(dotSizes, 1));

    const dotMaterial = new THREE.PointsMaterial({
      color: 0x14b8a6,
      size: 2.0,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const dots = new THREE.Points(dotGeometry, dotMaterial);
    globeGroup.add(dots);

    // 2. Latitude & Longitude Wireframe Rings
    const ringMaterial = new THREE.LineBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.15,
    });

    // Latitudes
    [-45, -20, 0, 20, 45].forEach((lat) => {
      const phiRad = (lat * Math.PI) / 180;
      const ringR = radius * Math.cos(phiRad);
      const ringY = radius * Math.sin(phiRad);

      const segments = 64;
      const ringPoints: THREE.Vector3[] = [];
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        ringPoints.push(new THREE.Vector3(Math.cos(theta) * ringR, ringY, Math.sin(theta) * ringR));
      }
      const ringGeom = new THREE.BufferGeometry().setFromPoints(ringPoints);
      const ringLine = new THREE.Line(ringGeom, ringMaterial);
      globeGroup.add(ringLine);
    });

    // Longitudes
    [0, 45, 90, 135].forEach((lng) => {
      const segments = 64;
      const longPoints: THREE.Vector3[] = [];
      const lngRad = (lng * Math.PI) / 180;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        const x = Math.cos(theta) * radius * Math.cos(lngRad);
        const y = Math.sin(theta) * radius;
        const z = Math.cos(theta) * radius * Math.sin(lngRad);
        longPoints.push(new THREE.Vector3(x, y, z));
      }
      const longGeom = new THREE.BufferGeometry().setFromPoints(longPoints);
      const longLine = new THREE.Line(longGeom, ringMaterial);
      globeGroup.add(longLine);
    });

    // 3. Hospital Hub Beacons (Pulsating telemetry pins)
    const hubs = [
      { lat: 40.71, lng: -74.0, name: 'NYC Hub' },
      { lat: 51.5, lng: -0.12, name: 'London Center' },
      { lat: 35.68, lng: 139.69, name: 'Tokyo Research' },
      { lat: 1.35, lng: 103.82, name: 'Singapore Med' },
      { lat: 19.07, lng: 72.87, name: 'Mumbai General' },
      { lat: -33.86, lng: 151.2, name: 'Sydney Health' },
    ];

    const hubPoints: THREE.Vector3[] = [];
    const pinGroup = new THREE.Group();

    hubs.forEach((hub) => {
      const latRad = (hub.lat * Math.PI) / 180;
      const lngRad = (hub.lng * Math.PI) / 180;
      const x = radius * Math.cos(latRad) * Math.cos(lngRad);
      const y = radius * Math.sin(latRad);
      const z = radius * Math.cos(latRad) * Math.sin(lngRad);
      const vec = new THREE.Vector3(x, y, z);
      hubPoints.push(vec);

      // Core point
      const pinGeom = new THREE.SphereGeometry(1.6, 8, 8);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.copy(vec);
      pinGroup.add(pinMesh);

      // Outer ripple beacon
      const haloGeom = new THREE.RingGeometry(1.8, 3.2, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x2dd4bf,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const haloMesh = new THREE.Mesh(haloGeom, haloMat);
      haloMesh.position.copy(vec.clone().multiplyScalar(1.01));
      haloMesh.lookAt(vec.clone().multiplyScalar(2));
      pinGroup.add(haloMesh);
    });
    globeGroup.add(pinGroup);

    // 4. Arcs Connecting Global Medical Hubs
    const arcMaterial = new THREE.LineBasicMaterial({
      color: 0x14b8a6,
      transparent: true,
      opacity: 0.45,
    });

    for (let i = 0; i < hubPoints.length - 1; i++) {
      const p1 = hubPoints[i];
      const p2 = hubPoints[i + 1];
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      mid.normalize().multiplyScalar(radius + dist * 0.18);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const arcGeom = new THREE.BufferGeometry().setFromPoints(curve.getPoints(36));
      const arcLine = new THREE.Line(arcGeom, arcMaterial);
      globeGroup.add(arcLine);
    }

    // Interactive Drag rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotationVelocityX = 0.0018;
    let rotationVelocityY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;
      rotationVelocityX = deltaX * 0.001;
      rotationVelocityY = deltaY * 0.001;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Initial tilt
    globeGroup.rotation.x = 0.28;
    globeGroup.rotation.y = -0.5;

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Inertia & slow rotation (damped if user is hovering)
      if (!isDragging) {
        const speed = isHovered ? 0.0008 : 0.0022;
        globeGroup.rotation.y += (rotationVelocityX || speed);
        globeGroup.rotation.x += rotationVelocityY * 0.95;
        rotationVelocityX *= 0.96;
        rotationVelocityY *= 0.96;
      }

      // Shimmer beacon scale
      const pulse = 1 + Math.sin(elapsedTime * 3) * 0.2;
      pinGroup.children.forEach((child, idx) => {
        if (idx % 2 === 1) {
          child.scale.set(pulse, pulse, pulse);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || size;
      const h = container.clientHeight || size;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
      dotGeometry.dispose();
      dotMaterial.dispose();
      ringMaterial.dispose();
      arcMaterial.dispose();
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative cursor-grab active:cursor-grabbing select-none ${className}`}
      style={{ width: '100%', height: '100%', minHeight: size }}
    >
      {/* Subtle telemetry status chip overlay */}
      <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-md border border-teal-500/30 text-[11px] text-teal-300 font-mono-numbers pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
        <span>GLOBAL SYNC • 6 REGIONS ACTIVE</span>
      </div>
    </div>
  );
};

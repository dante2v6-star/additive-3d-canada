"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// Procedural CAD specimen for the hero. Uploaded geometry replaces it in the quote viewer.
export default function PartPreview({
  positions,
  hero = false,
}: {
  positions?: Float32Array;
  hero?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      queueMicrotask(() => setFailed(true));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 1000);
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: hero ? 0x35435a : 0x2658d5,
      roughness: 0.47,
      metalness: 0.3,
    });
    if (positions) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      geometry.computeVertexNormals();
      geometry.center();
      geometry.computeBoundingSphere();
      const radius = geometry.boundingSphere?.radius || 1;
      geometry.scale(2 / radius, 2 / radius, 2 / radius);
      group.add(new THREE.Mesh(geometry, material));
    } else {
      const shape = new THREE.Shape();
      shape.moveTo(-1.8, -1.2);
      shape.lineTo(1.8, -1.2);
      shape.lineTo(1.8, 1.2);
      shape.lineTo(-1.8, 1.2);
      shape.closePath();
      for (const x of [-1.15, 1.15])
        for (const y of [-0.6, 0.6]) {
          const hole = new THREE.Path();
          hole.absarc(x, y, 0.23, 0, Math.PI * 2, true);
          shape.holes.push(hole);
        }
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.32,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.06,
        bevelThickness: 0.05,
      });
      geo.center();
      group.add(new THREE.Mesh(geo, material));
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.64, 0.24, 16, 64),
        material,
      );
      ring.position.z = 0.25;
      group.add(ring);
    }
    group.rotation.set(-0.45, -0.45, 0.25);
    scene.add(group);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x637086, 3));
    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(3, 5, 7);
    scene.add(light);
    camera.position.set(4, 3.5, 7);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 14;
    controls.autoRotate = false;
    controls.target.set(0, 0, 0);
    controls.update();
    const render = () => renderer.render(scene, camera);
    controls.addEventListener("change", render);
    const resize = new ResizeObserver(() => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    });
    resize.observe(el);
    render();
    return () => {
      resize.disconnect();
      controls.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [positions, hero]);
  return (
    <div
      className={hero ? "part-preview hero-preview" : "part-preview"}
      ref={host}
      role="img"
      aria-label={
        hero
          ? "Interactive sample CAD mounting plate"
          : "Interactive preview of your uploaded STL"
      }
    >
      {failed && (
        <p className="preview-fallback">
          3D preview unavailable on this device. File analysis and quoting still
          work.
        </p>
      )}
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ดึง URLs ลิงก์ตรงจากเอกสาร Audit Spec
const ASSETS = {
  ground: 'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/ground_d1kjrx.png',
  player: 'https://raw.githubusercontent.com/banyapon/banyapon.github.io/refs/heads/main/studio/images/player.png',
  enemy: 'https://raw.githubusercontent.com/banyapon/banyapon.github.io/refs/heads/main/studio/images/enemy.png',
  boss: 'https://res.cloudinary.com/dsucg33fv/image/upload/v1782709455/boss_e8jti1.png'
};

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene, Camera, WebGLRenderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 2. Load Ground Tiling (50x50 Plane)
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(ASSETS.ground, (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(25, 25); // ทำ Tiling ซ้ำๆ
      
      const groundGeo = new THREE.PlaneGeometry(50, 50);
      const groundMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);
    });

    // 3. Billboarding Sprite System (สร้างสไปรท์ 2D หันหน้าเข้ากล้องตลอดเวลา)
    // สำหรับ Player, Enemy, Boss ให้ใช้วิธีเปลี่ยนค่า texture.offset.x และ y เพื่อขยับ Frame Animation

    // 4. Game Loop / Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // เพิ่มคำสั่งเคลื่อนที่ 8 ทิศทาง และตรวจสอบ Collision ที่นี่

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup when unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[500px]" />;
};

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { audio } from '../AudioEngine'; // เชื่อมต่อกับโมดูลเสียงหมอลำสังเคราะห์ของคุณ

// ลิงก์ตรงจาก Asset Spec ใน Audit Report สำหรับตัวเกมจริง
const ASSET_URLS = {
  ground: 'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/ground_d1kjrx.png',
  player: 'https://raw.githubusercontent.com/banyapon/banyapon.github.io/refs/heads/main/studio/images/player.png',
  enemy: 'https://raw.githubusercontent.com/banyapon/banyapon.github.io/refs/heads/main/studio/images/enemy.png',
  boss: 'https://res.cloudinary.com/dsucg33fv/image/upload/v1782709455/boss_e8jti1.png',
  item: 'https://raw.githubusercontent.com/banyapon/banyapon.github.io/refs/heads/main/studio/images/potion.png'
};

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // States สำหรับแสดงผลบน HUD หน้าจอเว็บบน Canvas
  const [hp, setHp] = useState(100);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'PLAYING' | 'GAMEOVER' | 'WIN'>('PLAYING');

  useEffect(() => {
    if (!containerRef.current) return;

    // ==========================================
    // 1. INITIALIZE THREE.JS ENGINE
    // ==========================================
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f051d); // บรรยากาศคืนงานเทศกาลด่านซ้าย
    scene.fog = new THREE.FogExp2(0x0f051d, 0.05);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    // วางมุมกล้องเฉียงสไตล์สถาปัตยกรรมเกม RPG (Isometric View)
    camera.position.set(0, 12, 14); 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // แสงสว่างในฉาก
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffaa44, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    //เริ่มเปิดดนตรีหมอลำทันทีเมื่อเข้าสู่ตัวเกม
    audio.startMusic();

    // ==========================================
    // 2. TEXTURE & MATERIAL BUILDER (ระบบจัดการ Sprite)
    // ==========================================
    const textureLoader = new THREE.TextureLoader();

    // สร้างพื้นแมพขนาด 50x50 และสั่งให้เกิดการทำภาพซ้ำ (Tiling)
    const groundTexture = textureLoader.load(ASSET_URLS.ground);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(15, 15);
    const groundMaterial = new THREE.MeshBasicMaterial({ map: groundTexture });
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const ground = new THREE.Mesh(groundGeo, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // ฟังก์ชันสร้างตัวละครแบบตัดเฟรม Sprite Sheet (256x256px ต่อเฟรมตาม Spec)
    const createSpriteMaterial = (url: string, tilesX: number, tilesY: number) => {
      const tex = textureLoader.load(url);
      tex.magFilter = THREE.NearestFilter; // คงความคมชัดแบบ Pixel Art
      tex.minFilter = THREE.NearestFilter;
      tex.repeat.set(1 / tilesX, 1 / tilesY);
      
      const mat = new THREE.SpriteMaterial({ map: tex, color: 0xffffff });
      return { texture: tex, material: mat };
    };

    // ==========================================
    // 3. GAME ENTITIES (ผู้เล่น, ศัตรู, ไอเทม)
    // ==========================================
    
    // สร้างผู้เล่น (Player)
    const playerSprite = createSpriteMaterial(ASSET_URLS.player, 4, 4); // 4 frames x 4 rows
    const playerMesh = new THREE.Sprite(playerSprite.material);
    playerMesh.scale.set(2.5, 2.5, 1);
    playerMesh.position.set(0, 1.25, 0);
    scene.add(playerMesh);

    // โครงสร้างตัวแปรควบคุมผู้เล่น
    const playerData = {
      x: 0, z: 0,
      hp: 100,
      score: 0,
      speed: 8.0,
      radius: 0.8,
      currentFrame: 0,
      currentRow: 0, // 0=หน้า, 1=ซ้าย, 2=ขวา, 3=หลัง
      animTimer: 0
    };

    // การเก็บข้อมูลออบเจกต์ในลูปเกม
    const enemies: any[] = [];
    const items: any[] = [];
    let bossMesh: THREE.Sprite | null = null;
    let bossData: any = null;

    // ฟังก์ชันสุ่มเกิดผีตาโขนสมุน (Enemies)
    const spawnEnemy = () => {
      if (gameState !== 'PLAYING' || enemies.length > 8) return;
      
      const esp = createSpriteMaterial(ASSET_URLS.enemy, 4, 2);
      const emesh = new THREE.Sprite(esp.material);
      emesh.scale.set(2, 2, 1);
      
      // เกิดรอบนอกระยะสายตาผู้เล่น
      const angle = Math.random() * Math.PI * 2;
      const dist = 15 + Math.random() * 5;
      const ex = playerData.x + Math.cos(angle) * dist;
      const ez = playerData.z + Math.sin(angle) * dist;
      
      emesh.position.set(ex, 1.0, ez);
      scene.add(emesh);
      
      enemies.push({
        mesh: emesh,
        tex: esp.texture,
        x: ex, z: ez,
        speed: 3.5 + Math.random() * 2,
        radius: 0.6,
        animTimer: 0,
        currentFrame: 0
      });
    };

    // ฟังก์ชันเกิดไอเทมกระติ๊บข้าวเหนียว / ยาเพิ่มพลัง (Items)
    const spawnItem = () => {
      if (items.length > 4) return;
      const isp = createSpriteMaterial(ASSET_URLS.item, 1, 1);
      const imesh = new THREE.Sprite(isp.material);
      imesh.scale.set(1.2, 1.2, 1);
      
      const ix = playerData.x + (Math.random() - 0.5) * 20;
      const iz = playerData.z + (Math.random() - 0.5) * 20;
      imesh.position.set(ix, 0.6, iz);
      scene.add(imesh);
      
      items.push({ mesh: imesh, x: ix, z: iz, radius: 0.5 });
    };

    // เรียกลูปการเกิดอัตโนมัติ
    const enemyInterval = setInterval(spawnEnemy, 2000);
    const itemInterval = setInterval(spawnItem, 5000);

    // ==========================================
    // 4. CONTROLS SYSTEM (ระบบบังคับ 8 ทิศทาง)
    // ==========================================
    const keys: { [key: string]: boolean } = {};
    const handleKeyDown = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // ==========================================
    // 5. CORE GAME LOOP (ระบบประมวลผลกลศาสตร์)
    // ==========================================
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const gameLoop = () => {
      animationFrameId = requestAnimationFrame(gameLoop);
      
      const delta = clock.getDelta();
      if (playerData.hp <= 0) return; // ถ้าตายให้หยุดประมวลผลลูป

      // 5.1 การประมวลผลการเดินของผู้เล่น (8 ทิศทาง)
      let moveX = 0;
      let moveZ = 0;
      
      if (keys['w'] || keys['arrowup']) moveZ -= 1;
      if (keys['s'] || keys['arrowdown']) moveZ += 1;
      if (keys['a'] || keys['arrowleft']) moveX -= 1;
      if (keys['d'] || keys['arrowright']) moveX += 1;

      if (moveX !== 0 || moveZ !== 0) {
        // ทำนอร์มัลไลซ์ความเร็วไม่ให้กดเฉียงแล้ววิ่งเร็วเกินไป
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        playerData.x += (moveX / length) * playerData.speed * delta;
        playerData.z += (moveZ / length) * playerData.speed * delta;

        // เปลี่ยนทิศทางแถวรูปตามแกนเคลื่อนที่ (Sprite Sheet Row Selector)
        if (Math.abs(moveX) > Math.abs(moveZ)) {
          playerData.currentRow = moveX > 0 ? 2 : 1; // ขวา หรือ ซ้าย
        } else {
          playerData.currentRow = moveZ > 0 ? 0 : 3; // หน้า หรือ หลัง
        }

        // เล่นเสียงขยับหรือเอฟเฟกต์ตามสเต็ป
        playerData.animTimer += delta;
        if (playerData.animTimer > 0.12) {
          playerData.currentFrame = (playerData.currentFrame + 1) % 4;
          playerData.animTimer = 0;
        }
      } else {
        playerData.currentFrame = 0; // ยืนนิ่งเฟรมแรก
      }

      // อัปเดตตำแหน่งกล่องโมเดลผู้เล่นและอัปเดตหน้าต่างตัดชิ้นภาพพิกเซล
      playerMesh.position.set(playerData.x, 1.25, playerData.z);
      playerSprite.texture.offset.set(playerData.currentFrame * 0.25, (3 - playerData.currentRow) * 0.25);

      // กล้องวิ่งติดตามตัวละครหลักอย่างนุ่มนวล (Camera Follow)
      camera.position.set(playerData.x, playerData.positionY || 12, playerData.z + 14);
      camera.lookAt(playerData.x, 1, playerData.z);

      // 5.2 ขยับระบบ AI ของผีตาโขนสมุน (Enemy AI & Physics)
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // วิ่งตรงดิ่งเข้าหาผู้เล่นตลอดเวลา
        const dx = playerData.x - enemy.x;
        const dz = playerData.z - enemy.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 0.1) {
          enemy.x += (dx / dist) * enemy.speed * delta;
          enemy.z += (dz / dist) * enemy.speed * delta;
          enemy.mesh.position.set(enemy.x, 1.0, enemy.z);
        }

        // ตัดเฟรมอนิเมชันของศัตรู
        enemy.animTimer += delta;
        if (enemy.animTimer > 0.15) {
          enemy.currentFrame = (enemy.currentFrame + 1) % 4;
          enemy.tex.offset.set(enemy.currentFrame * 0.25, 0);
          enemy.animTimer = 0;
        }

        // ระบบตรวจจับการชน (AABB/Distance Collision) ระหว่างผู้เล่นกับศัตรู
        if (dist < (playerData.radius + enemy.radius)) {
          // ผู้เล่นโดนชน ได้รับบาดเจ็บ
          playerData.hp -= 15 * delta; // ค่อยๆ ลดความดันเลือด
          setHp(Math.max(0, Math.floor(playerData.hp)));
          audio.playHurt();

          if (playerData.hp <= 0) {
            handleGameOver(false);
          }
        }
      }

      // 5.3 ตรวจสอบการเดินไปเก็บไอเทมยารักษาโรค (Item Collection)
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const idx = playerData.x - item.x;
        const idz = playerData.z - item.z;
        const idist = Math.sqrt(idx * idx + idz * idz);

        if (idist < (playerData.radius + item.radius)) {
          // เก็บของได้สำเร็จ
          audio.playCollect();
          playerData.hp = Math.min(100, playerData.hp + 25); // เติมเลือด
          playerData.score += 100;
          setHp(Math.floor(playerData.hp));
          setScore(playerData.score);
          
          // ลบออกจากฉาก 3D
          scene.remove(item.mesh);
          items.splice(i, 1);

          // เงื่อนไขสปอว์นบอส: เมื่อเก็บของครบหรือแต้มถึง 300 แต้ม
          if (playerData.score >= 300 && !bossMesh) {
            triggerBossEncounter();
          }
        }
      }

      // 5.4 จัดการระบบพฤติกรรมบอสพญาแถน (Boss Logic)
      if (bossMesh && bossData) {
        const bdx = playerData.x - bossData.x;
        const bdz = playerData.z - bossData.z;
        const bdist = Math.sqrt(bdx * bdx + bdz * bdz);

        // บอสวิ่งไล่กวดด้วยความเร็วสูง
        bossData.x += (bdx / bdist) * bossData.speed * delta;
        bossData.z += (bdz / bdist) * bossData.speed * delta;
        bossMesh.position.set(bossData.x, 2.0, bossData.z);

        if (bdist < (playerData.radius + bossData.radius)) {
          playerData.hp -= 40 * delta; // โดนบอสตีแรงมาก
          setHp(Math.max(0, Math.floor(playerData.hp)));
          if (playerData.hp <= 0) handleGameOver(false);
        }

        // เงื่อนไขในการเคลียร์เกม: ผู้เล่นหลบหลีกและล่อบอสให้ชนกันครบ 20 วินาที จะชนะ
        bossData.survivalTime -= delta;
        if (bossData.survivalTime <= 0) {
          handleGameOver(true); // ชนะเกมเทศกาลด่านซ้ายสำเร็จ!
        }
      }

      renderer.render(scene, camera);
    };

    // ฟังก์ชันปลุกบอสใหญ่ประจำด่าน
    const triggerBossEncounter = () => {
      const bsp = createSpriteMaterial(ASSET_URLS.boss, 4, 2);
      bossMesh = new THREE.Sprite(bsp.material);
      bossMesh.scale.set(4.5, 4.5, 1); // บอสผีตาโขนยักษ์ตัวใหญ่มาก
      bossMesh.position.set(playerData.x, 2.0, playerData.z - 10);
      scene.add(bossMesh);

      bossData = {
        x: playerData.x, z: playerData.z - 10,
        speed: 6.0,
        radius: 1.8,
        survivalTime: 20.0 // ต้องรอดชีวิตจากบอส 20 วินาที
      };
      audio.playSkillRing(); // เปิดเอฟเฟกต์บอสคำราม
    };

    // ฟังก์ชันสั่งหยุดเกมและเปลี่ยนหน้าจอสรุปคะแนน
    const handleGameOver = (isWin: boolean) => {
      clearInterval(enemyInterval);
      clearInterval(itemInterval);
      audio.stopMusic();
      
      if (isWin) {
        setGameState('WIN');
        audio.playWin();
      } else {
        setGameState('GAMEOVER');
        audio.playGameOver();
      }
    };

    // รันลูปแอนิเมชันขับเคลื่อนตัวเกมจริง
    animateId = requestAnimationFrame(gameLoop);

    // ==========================================
    // 6. CLEANUP (ถอนรากถอนโคนหน่วยความจำเมื่อปิดหน้าต่าง)
    // ==========================================
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(enemyInterval);
      clearInterval(itemInterval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
      audio.stopMusic();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [gameState]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col justify-center items-center">
      
      {/* 📊 HUD ส่วนควบคุมจำลองแสดงผลหน้าจอหน้าบ้าน */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-purple-500/30 text-white min-w-[200px]">
        <h2 className="text-xl font-bold text-yellow-400 mb-1">👺 Dan Sai Adventure</h2>
        <p className="text-sm text-gray-300">วิถีผู้กล้าหน้ากากผีตาโขน</p>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span>พลังชีวิต (HP)</span>
            <span className={hp > 30 ? "text-green-400" : "text-red-500 animate-pulse"}>{hp}%</span>
          </div>
          <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-green-500 h-full transition-all duration-100" style={{ width: `${hp}%` }} />
          </div>
        </div>
        <p className="mt-3 text-sm">คะแนนสะสม: <span className="text-cyan-400 font-mono font-bold text-lg">{score}</span></p>
      </div>

      {/* 🎮 พื้นที่หลักในการเรนเดอร์ WebGL Engine Graphics */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* 🕹️ แผงควบคุมเสมือนด้านล่างแนะนำผู้ใช้บนคอมพิวเตอร์ */}
      <div className="absolute bottom-4 z-10 bg-black/50 text-white/70 px-4 py-2 rounded-full text-xs pointer-events-none">
        วิธีกดเล่น: ใช้ปุ่ม <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-white">W</kbd> <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-white">A</kbd> <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-white">S</kbd> <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-white">D</kbd> หรือปุ่มลูกศรในการเดินล่อหน้ากากผีตาโขนโบราณ
      </div>

      {/* 🚨 หน้าต่างโมดอลป๊อปอัปเมื่อเกมจบ (Game Over / Victory Screens) */}
      {gameState !== 'PLAYING' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-lg z-20 flex flex-col justify-center items-center text-white animate-fade-in">
          {gameState === 'WIN' ? (
            <div className="text-center p-8 bg-emerald-950/40 border border-emerald-500 rounded-2xl max-w-md shadow-2xl">
              <h1 className="text-5xl font-extrabold text-emerald-400 mb-4 animate-bounce">🏆 ชัยชนะครั้งใหญ่!</h1>
              <p className="text-gray-300 mb-6">คุณสามารถเอาชีวิตรอดจากการไล่ล่าของพญาแถนและสืบสานงานบุญหลวงด่านซ้ายได้สำเร็จ</p>
              <button onClick={() => window.location.reload()} className="bg-gradient-to-r from-emerald-500 to-teal-600 font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
                ร่วมเทศกาลอีกครั้ง
              </button>
            </div>
          ) : (
            <div className="text-center p-8 bg-red-950/40 border border-red-500 rounded-2xl max-w-md shadow-2xl">
              <h1 className="text-5xl font-extrabold text-red-500 mb-4">💀 พลังชีวิตหมดสิ้น</h1>
              <p className="text-gray-300 mb-6">คุณถูกหน้ากากผีตาโขนโบราณครอบงำสติวิญญาณกลางลานพิธี</p>
              <p className="text-sm text-yellow-400 mb-6">คะแนนที่คุณทำได้สุทธิ: {score} แต้ม</p>
              <button onClick={() => window.location.reload()} className="bg-gradient-to-r from-red-600 to-orange-600 font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
                คืนชีพผู้กล้า (Restart)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

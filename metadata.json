import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { audio } from './AudioEngine';
import { Character, GameSettings } from '../types';
import { createClayBrickTexture, createGrassTexture } from './ProceduralTextures';
import { 
  Trophy, 
  RotateCcw, 
  Flame, 
  Volume2, 
  ShieldAlert, 
  Sparkles, 
  ArrowLeft, 
  Info,
  ShieldAlert as AlertIcon
} from 'lucide-react';

interface GameCanvasProps {
  character: Character;
  settings: GameSettings;
  onExit: () => void;
  onGameOver: (score: number, name?: string) => void;
}

// Game Object structures for our Three.js engine
interface CollectibleItem {
  mesh: THREE.Group;
  type: 'mask' | 'kratip' | 'bell';
  scoreValue: number;
  healthValue: number;
  energyValue: number;
}

interface MiniGhost {
  mesh: THREE.Group;
  spriteMaterial: THREE.MeshBasicMaterial;
  x: number;
  z: number;
  health: number;
  maxHealth: number;
  speed: number;
  directionTimer: number;
  dirX: number;
  dirZ: number;
  isStunned: boolean;
  stunTimer: number;
  flashTimer: number;
  isDancing: boolean;

  // New features for enemy.png animation & state
  animTimer: number;
  currentFrame: number;
  isDying: boolean;
  dieTimer: number;
  dieVelocityX: number;
  dieVelocityZ: number;
  attackFlashTimer: number;
  ghostTexture: THREE.Texture;

  // Knockback properties
  knockbackX?: number;
  knockbackZ?: number;
  knockbackTimer?: number;
}

interface GrassEntity {
  group: THREE.Group;
  mesh: THREE.Mesh;
  x: number;
  z: number;
  currentScaleY: number;
  targetScaleY: number;
  baseScaleY: number;
}

interface FloatingText {
  element: HTMLDivElement;
  x: number;
  y: number;
  z: number;
  life: number;
}

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
}

export default function GameCanvas({ character, settings, onExit, onGameOver }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uiOverlayRef = useRef<HTMLDivElement>(null);

  // React states to bind to HUD
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [energy, setEnergy] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState('ผู้กล้าแดนซ้าย');
  const [gameStarted, setGameStarted] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [skillCooldown, setSkillCooldown] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [ghostsRemaining, setGhostsRemaining] = useState(8);

  // Virtual Controls states
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({
    w: false, a: false, s: false, d: false,
    ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
    p: false, o: false
  });

  // Track player coordinates for HUD compass/radar
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 });

  // Refs for ThreeJS objects to allow direct manipulation in requestAnimationFrame
  const engineRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    playerMesh: THREE.Mesh;
    playerTexture: THREE.Texture;
    playerMaterial: THREE.MeshBasicMaterial;
    
    // Position/Physics
    playerX: number;
    playerZ: number;
    playerVelocityY: number;
    isGrounded: boolean;
    facingLeft: boolean;

    // Animation state
    currentFrame: number;
    animationRow: number; // 0=Idle, 1=Walk, 2=Attack, 3=Dance
    animationTimer: number;
    attackTimer: number;
    danceTimer: number;

    // Scene collections
    collectibles: CollectibleItem[];
    ghosts: MiniGhost[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    grassEntities: GrassEntity[];
    
    // Lights and atmosphere
    sunLight: THREE.DirectionalLight;
    templeGroup: THREE.Group;
    
    // Custom item sprite assets
    itemTexture: THREE.Texture;
    itemMaterial: THREE.MeshBasicMaterial;
    itemGeo: THREE.PlaneGeometry;

    // Base sprite textures
    enemyTextureBase: THREE.Texture;
    grassTexture: THREE.Texture;
  } | null>(null);

  // Key Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        audio.playSelect();
        setIsPaused(prev => !prev);
        return;
      }

      if (isPaused) return; // Ignore keys if game is paused

      const key = e.key.toLowerCase();
      // Handle key bindings mapping
      const controls = settings.controls;
      let mappedKey = key;

      if (key === controls.left.toLowerCase()) mappedKey = 'a';
      else if (key === controls.right.toLowerCase()) mappedKey = 'd';
      else if (key === controls.jump.toLowerCase()) mappedKey = 'w';
      else if (key === controls.action.toLowerCase()) mappedKey = 'p';

      setActiveKeys(prev => ({ ...prev, [mappedKey]: true, [e.key]: true }));

      // Direct triggers for attack or skill
      if (e.key.toLowerCase() === 'p') {
        triggerAttack();
      }
      if (e.key.toLowerCase() === 'o') {
        triggerDanceSkill();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isPaused) return; // Ignore keys if game is paused

      const key = e.key.toLowerCase();
      const controls = settings.controls;
      let mappedKey = key;

      if (key === controls.left.toLowerCase()) mappedKey = 'a';
      else if (key === controls.right.toLowerCase()) mappedKey = 'd';
      else if (key === controls.jump.toLowerCase()) mappedKey = 'w';
      else if (key === controls.action.toLowerCase()) mappedKey = 'p';

      setActiveKeys(prev => ({ ...prev, [mappedKey]: false, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [settings, energy, skillCooldown, isPaused]);

  // Handle Action Triggers
  const triggerAttack = () => {
    const engine = engineRef.current;
    if (!engine || isDead || isGameWon) return;

    if (engine.attackTimer <= 0) {
      engine.attackTimer = 0.4; // 400ms attack animation
      engine.animationRow = 2; // Row 2 is Attack
      engine.currentFrame = 0;
      audio.playShoot();

      // Check hits on ghosts in range
      const attackRange = 3.5;
      const playerPosVec = new THREE.Vector3(engine.playerX, 0.8, engine.playerZ);
      
      engine.ghosts.forEach(ghost => {
        if (ghost.isStunned && ghost.isDancing) return; // don't hurt dancing pacified ghosts
        
        const ghostPos = ghost.mesh.position;
        const dist = playerPosVec.distanceTo(ghostPos);
        
        if (dist < attackRange) {
          // Pushback direction
          const pushDir = new THREE.Vector3().subVectors(ghostPos, playerPosVec).normalize();
          if (ghost.health > 1) {
            // First hit knockback: knock them backwards from movement direction (away from player)
            ghost.knockbackX = pushDir.x * 18.0;
            ghost.knockbackZ = pushDir.z * 18.0;
            ghost.knockbackTimer = 0.35; // 350ms of smooth sliding knockback
            ghost.mesh.position.addScaledVector(pushDir, 1.2); // instant nudge to break contact immediately
            ghost.health -= 1;
            ghost.flashTimer = 0.35; // short white flash
          } else {
            // Second hit: die and fly away out of the scene or blink white rapidly
            ghost.health = 0;
            ghost.isDying = true;
            ghost.dieTimer = 1.2;
            ghost.dieVelocityX = pushDir.x * 18.0;
            ghost.dieVelocityZ = pushDir.z * 18.0;
          }
          audio.playHurt();

          if (ghost.isDying) {
            // Defeated! Drop bonus item
            spawnItemReward(ghostPos.x, ghostPos.z);
            spawnFlashParticles(ghostPos, new THREE.Color(character.accentColor), 35);
            
            // Update stats
            setScore(prev => prev + 250);

            // Floating score text
            spawnFloatingText('DEFEATED! 💫 (+250 PTS)', ghostPos.x, ghostPos.y + 2, ghostPos.z, '#fbbf24');

            // Play collect audio
            audio.playCollect();
          } else {
            // Spawn sparkling dust particle effect
            spawnFlashParticles(ghostPos, new THREE.Color('#f43f5e'), 15);

            // Spawn Floating Combat Text
            spawnFloatingText('-1 HP (KNOCKBACK! 💥)', ghostPos.x, ghostPos.y + 1.5, ghostPos.z, '#ef4444');
          }
        }
      });
    }
  };

  const triggerDanceSkill = () => {
    const engine = engineRef.current;
    if (!engine || isDead || isGameWon || energy < 15 || skillCooldown > 0) return;

    // Use energy
    setEnergy(prev => Math.max(0, prev - 15));
    setSkillCooldown(6); // 6 seconds cooldown

    engine.danceTimer = 1.8; // 1.8 seconds dancing
    engine.animationRow = 3; // Row 3 is Dance
    engine.currentFrame = 0;

    audio.playWin();

    // Spawn massive beautiful circular aura particle wave!
    const playerPos = new THREE.Vector3(engine.playerX, 0.2, engine.playerZ);
    spawnAuraWave(playerPos, new THREE.Color(character.accentColor));

    // Calm all ghosts in range - make them dance!
    const danceRange = 7.5;
    engine.ghosts.forEach(ghost => {
      const dist = ghost.mesh.position.distanceTo(playerPos);
      if (dist < danceRange) {
        ghost.isStunned = true;
        ghost.isDancing = true;
        ghost.stunTimer = 5.0; // Dance for 5 seconds!
        ghost.health = ghost.maxHealth; // Heals/Pacifies them

        // Spawn hearts/stars particles
        spawnFlashParticles(ghost.mesh.position, new THREE.Color('#f43f5e'), 12);
        spawnFloatingText('SANTAI! 🌸', ghost.mesh.position.x, ghost.mesh.position.y + 1.8, ghost.mesh.position.z, '#f43f5e');
      }
    });

    // Heal the player!
    setLives(prev => {
      const nextLives = Math.min(5, prev + 1);
      spawnFloatingText('+1 LIFE ❤️ 🌸', engine.playerX, 2.5, engine.playerZ, '#22c55e');
      return nextLives;
    });
  };

  // Skill Cooldown Ticker
  useEffect(() => {
    if (skillCooldown > 0) {
      const timer = setTimeout(() => {
        setSkillCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [skillCooldown]);

  // Main ThreeJS Setup & Loop
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // 1. Initialize Scene, Camera, Renderer
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Midnight blue atmosphere
    scene.background = new THREE.Color('#030712');
    scene.fog = new THREE.FogExp2('#030712', 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    // Camera starts high and angled
    camera.position.set(0, 16, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Decorative Lights & Sun
    const ambientLight = new THREE.AmbientLight('#2a1b40', 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#c084fc', 1.8);
    sunLight.position.set(15, 30, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    const d = 30;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Warm temple glow light
    const templeGlow = new THREE.PointLight('#f59e0b', 3.0, 18);
    templeGlow.position.set(0, 3, 0);
    scene.add(templeGlow);

    // 3. Build Ground (Size 50)
    const textureLoader = new THREE.TextureLoader();
    const groundTex = textureLoader.load('https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/ground_d1kjrx.png');
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(16, 16); // small tiling for high detail
    
    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.8,
      metalness: 0.1
    });
    const groundPlane = new THREE.Mesh(groundGeo, groundMat);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = 0;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);

    // 4. Build a beautiful traditional Thai Temple Shrine (Wat Pon Chai) in center
    const templeGroup = new THREE.Group();
    templeGroup.position.set(0, 0.2, 0);

    // Base Steps (Golden & Stone blocks)
    const baseMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.4 });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 });
    const goldMat = new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.8, roughness: 0.2 });

    const step1 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 6), baseMat);
    step1.position.y = 0.25;
    step1.castShadow = true;
    step1.receiveShadow = true;
    templeGroup.add(step1);

    const step2 = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.5, 4.5), goldMat);
    step2.position.y = 0.75;
    step2.castShadow = true;
    step2.receiveShadow = true;
    templeGroup.add(step2);

    // Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.5, 8);
    const pillarPositions = [
      [-1.8, 2.5, -1.8], [1.8, 2.5, -1.8],
      [-1.8, 2.5, 1.8], [1.8, 2.5, 1.8]
    ];
    pillarPositions.forEach(p => {
      const pillar = new THREE.Mesh(pillarGeo, woodMat);
      pillar.position.set(p[0], p[1], p[2]);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      templeGroup.add(pillar);
    });

    // Traditional tiered Thai roof (red & gold tiles)
    const roofMat = new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.3 });
    const roof1 = new THREE.Mesh(new THREE.ConeGeometry(3.5, 2.0, 4), roofMat);
    roof1.position.y = 5.0;
    roof1.rotation.y = Math.PI / 4;
    roof1.castShadow = true;
    templeGroup.add(roof1);

    const roof2 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.8, 4), roofMat);
    roof2.position.y = 6.2;
    roof2.rotation.y = Math.PI / 4;
    roof2.castShadow = true;
    templeGroup.add(roof2);

    // Golden Pinnacle
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.2, 1.8, 8), goldMat);
    spire.position.y = 7.8;
    spire.castShadow = true;
    templeGroup.add(spire);

    // Beautiful Sacred Phi Ta Khon mask statue inside shrine
    const statueGroup = new THREE.Group();
    statueGroup.position.set(0, 1.8, 0);
    const statueBase = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.4, 16), baseMat);
    statueGroup.add(statueBase);
    
    // Glowing magical flame/orb on the altar
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshBasicMaterial({ color: '#f59e0b', transparent: true, opacity: 0.9 })
    );
    orb.position.y = 0.5;
    statueGroup.add(orb);
    templeGroup.add(statueGroup);

    scene.add(templeGroup);

    // 5. Add boundary decorations: Festival flags (Tung) & Bamboo fences
    const fenceMat = new THREE.MeshStandardMaterial({ color: '#a16207', roughness: 0.9 });
    const boundaryRadius = 24;
    const fenceCount = 36;
    
    for (let i = 0; i < fenceCount; i++) {
      const angle = (i / fenceCount) * Math.PI * 2;
      const fx = Math.cos(angle) * boundaryRadius;
      const fz = Math.sin(angle) * boundaryRadius;

      // Create a rustic wooden post
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.5, 6), fenceMat);
      post.position.set(fx, 1.25, fz);
      post.castShadow = true;
      post.receiveShadow = true;
      scene.add(post);

      // Add colorful festive traditional triangle flags on some posts!
      if (i % 3 === 0) {
        const flagColors = ['#f43f5e', '#10b981', '#3b82f6', '#fbbf24', '#a855f7'];
        const flagColor = flagColors[Math.floor(Math.random() * flagColors.length)];
        const flagMat = new THREE.MeshStandardMaterial({ color: flagColor, roughness: 0.5, side: THREE.DoubleSide });
        
        // Horizontal bar
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), fenceMat);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(fx + Math.cos(angle + 0.2) * 0.5, 2.4, fz + Math.sin(angle + 0.2) * 0.5);
        scene.add(bar);

        // Hanging fabric flag (Triangle)
        const flagGeo = new THREE.BufferGeometry();
        const vertices = new Float32Array([
          0, 2.4, 0,
          0.8, 1.6, 0,
          0, 1.4, 0
        ]);
        flagGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const flagMesh = new THREE.Mesh(flagGeo, flagMat);
        flagMesh.position.set(fx, 0, fz);
        // Rotate flag to look beautiful
        flagMesh.rotation.y = angle + Math.PI / 2;
        scene.add(flagMesh);
      }
    }

    // 6. Create Player Animated 2D Sprite Sheet texture
    // Reusing the existing textureLoader declared above
    // Load the 4x4 player mask sprite sheet
    const playerTexture = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439981/player_mask_fmn9yv.png'
    );
    playerTexture.wrapS = THREE.RepeatWrapping;
    playerTexture.wrapT = THREE.RepeatWrapping;
    
    // Set view repeat to 1/4 of size because we have 4x4 frames
    playerTexture.repeat.set(0.25, 0.25);
    // Row 0 is Idle (top of image, offset.y = 0.75)
    playerTexture.offset.set(0, 0.75);

    // Create a Plane mesh that will face the camera (Billboard behavior)
    // Custom flat material for retro high-contrast look
    const playerMaterial = new THREE.MeshBasicMaterial({
      map: playerTexture,
      transparent: true,
      alphaTest: 0.1, // crisp pixel edges
      side: THREE.DoubleSide
    });

    const playerGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const playerMesh = new THREE.Mesh(playerGeo, playerMaterial);
    playerMesh.position.set(4, 1.2, 4); // start slightly off center
    playerMesh.castShadow = true;
    playerMesh.receiveShadow = true;
    scene.add(playerMesh);

    // 7. Spawn floating collectible items
    const itemTexture = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439981/item_a371ol.png'
    );
    const itemMaterial = new THREE.MeshBasicMaterial({
      map: itemTexture,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide
    });
    const itemGeo = new THREE.PlaneGeometry(1.4, 1.4);

    const collectibles: CollectibleItem[] = [];
    const itemPositions = [
      { x: -12, z: -12, type: 'mask' },
      { x: 12, z: -12, type: 'mask' },
      { x: -12, z: 12, type: 'mask' },
      { x: 12, z: 12, type: 'mask' },
      { x: -6, z: -18, type: 'kratip' },
      { x: 18, z: 6, type: 'kratip' },
      { x: -15, z: 3, type: 'bell' },
      { x: 14, z: 16, type: 'bell' },
      { x: 3, z: -14, type: 'bell' },
      { x: -8, z: 10, type: 'bell' },
    ];

    itemPositions.forEach((pos) => {
      const itemGroup = new THREE.Group();
      itemGroup.position.set(pos.x, 0.8, pos.z);

      // Create 2D Sprite plane facing camera (tilted 0.18 pitch to align with isometric-ish view)
      const itemMesh = new THREE.Mesh(itemGeo, itemMaterial);
      itemMesh.castShadow = true;
      itemGroup.add(itemMesh);

      // Add a cool light circle ring indicator below the item
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.5, 0.6, 16),
        new THREE.MeshBasicMaterial({ 
          color: '#f43f5e',
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.79;
      itemGroup.add(ring);

      scene.add(itemGroup);
      collectibles.push({
        mesh: itemGroup,
        type: 'mask',
        scoreValue: 150,
        healthValue: 1, // restores 1 hit / life
        energyValue: 20
      });
    });

    // 8. Spawn grass randomly across the map
    const grassTexture = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439980/grass_2_kjkske.png'
    );
    grassTexture.wrapS = THREE.ClampToEdgeWrapping;
    grassTexture.wrapT = THREE.ClampToEdgeWrapping;

    const grassMat = new THREE.MeshBasicMaterial({
      map: grassTexture,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide
    });

    const grassEntities: GrassEntity[] = [];
    const grassCount = 100;
    for (let i = 0; i < grassCount; i++) {
      let gx = 0, gz = 0;
      let valid = false;
      let attempts = 0;
      while (!valid && attempts < 50) {
        gx = Math.random() * 44 - 22;
        gz = Math.random() * 44 - 22;
        const distFromCenter = Math.sqrt(gx * gx + gz * gz);
        if (distFromCenter > 4.5) {
          valid = true;
        }
        attempts++;
      }

      const grassGroup = new THREE.Group();
      grassGroup.position.set(gx, 0.0, gz);

      // Randomize base scale slightly for visual variety
      const randomWidth = 0.9 + Math.random() * 0.5;
      const randomHeight = 0.9 + Math.random() * 0.6;

      const grassMesh = new THREE.Mesh(new THREE.PlaneGeometry(randomWidth, randomHeight), grassMat);
      // Place the center of mesh so the bottom of the plane aligns perfectly with Y=0
      grassMesh.position.y = randomHeight / 2;
      
      // Face the camera slightly, with a little bit of randomized horizontal (Y) and roll (Z) angle to look organic
      const pitch = 0.18 + Math.random() * 0.05;
      const yaw = Math.random() * 0.4 - 0.2;
      const roll = Math.random() * 0.1 - 0.05;
      grassMesh.rotation.set(pitch, yaw, roll);
      
      grassMesh.castShadow = true;
      grassGroup.add(grassMesh);

      scene.add(grassGroup);

      grassEntities.push({
        group: grassGroup,
        mesh: grassMesh,
        x: gx,
        z: gz,
        currentScaleY: 1.0,
        targetScaleY: 1.0,
        baseScaleY: 1.0 // This will hold the relative scale multiplier, defaulted to 1.0
      });
    }

    // 9. Spawn mischievous wandering Phi Ta Khon ghosts
    const enemyTextureBase = textureLoader.load(
      'https://res.cloudinary.com/dsucg33fv/image/upload/v1782439979/enemy_mp1zhh.png'
    );

    const ghosts: MiniGhost[] = [];
    const ghostPositions = [
      { x: -18, z: -5 },
      { x: 18, z: -10 },
      { x: -10, z: 18 },
      { x: 15, z: 15 },
      { x: -16, z: -16 },
      { x: 16, z: -18 },
      { x: -2, z: -16 },
      { x: 12, z: -1 },
    ];

    ghostPositions.forEach((gPos, idx) => {
      const gGroup = new THREE.Group();
      gGroup.position.set(gPos.x, 1.0, gPos.z);

      // Clone texture so each ghost has its own anim offset
      const ghostTex = enemyTextureBase.clone();
      ghostTex.wrapS = THREE.RepeatWrapping;
      ghostTex.wrapT = THREE.RepeatWrapping;
      ghostTex.repeat.set(0.25, 0.5); // 4 columns, 2 rows
      ghostTex.offset.set(0, 0.5); // Top row is Idle ("ยืน")

      const gMat = new THREE.MeshBasicMaterial({
        map: ghostTex,
        transparent: true,
        alphaTest: 0.1,
        color: new THREE.Color('#ffffff') // Keep original bright color pixels
      });

      const gMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), gMat);
      gMesh.castShadow = true;
      gMesh.receiveShadow = true;
      gMesh.rotation.set(0.18, 0, 0); // face camera slightly
      gGroup.add(gMesh);

      // Cute small floating ghost light indicator
      const glowLight = new THREE.PointLight(new THREE.Color('#f43f5e'), 1.2, 5);
      glowLight.position.set(0, 0, 0);
      gGroup.add(glowLight);

      scene.add(gGroup);
      ghosts.push({
        mesh: gGroup,
        spriteMaterial: gMat,
        x: gPos.x,
        z: gPos.z,
        health: 2,
        maxHealth: 2,
        speed: 1.5 + Math.random() * 1.5,
        directionTimer: 0,
        dirX: Math.random() * 2 - 1,
        dirZ: Math.random() * 2 - 1,
        isStunned: false,
        stunTimer: 0,
        flashTimer: 0,
        isDancing: false,

        // anim variables
        animTimer: 0,
        currentFrame: 0,
        isDying: false,
        dieTimer: 0,
        dieVelocityX: 0,
        dieVelocityZ: 0,
        attackFlashTimer: 0,
        ghostTexture: ghostTex
      });
    });

    setGhostsRemaining(ghosts.length);

    // Save references
    engineRef.current = {
      scene,
      camera,
      renderer,
      playerMesh,
      playerTexture,
      playerMaterial,
      
      playerX: 4,
      playerZ: 4,
      playerVelocityY: 0,
      isGrounded: true,
      facingLeft: false,

      currentFrame: 0,
      animationRow: 0, // Idle
      animationTimer: 0,
      attackTimer: 0,
      danceTimer: 0,

      collectibles,
      ghosts,
      particles: [],
      floatingTexts: [],
      grassEntities,
      
      sunLight,
      templeGroup,

      itemTexture,
      itemMaterial,
      itemGeo,

      enemyTextureBase,
      grassTexture
    };

    setGameStarted(true);
    audio.startMusic();

    // 10. Resize handler via ResizeObserver to support robust container layouts
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      
      if (engineRef.current) {
        const { camera, renderer } = engineRef.current;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });

    resizeObserver.observe(containerRef.current);

    // 11. Clean up
    return () => {
      resizeObserver.disconnect();
      audio.stopMusic();
      
      // Clean up WebGL resources
      renderer.dispose();
      groundTex.dispose();
      playerTexture.dispose();
      enemyTextureBase.dispose();
      grassTexture.dispose();
      itemTexture.dispose();
      itemMaterial.dispose();
      itemGeo.dispose();
    };
  }, [character]);

  // Handle item reward spawn on ghost defeat
  const spawnItemReward = (x: number, z: number) => {
    const engine = engineRef.current;
    if (!engine) return;

    const itemGroup = new THREE.Group();
    itemGroup.position.set(x, 0.8, z);

    // Create 2D Sprite plane facing camera
    const itemMesh = new THREE.Mesh(engine.itemGeo, engine.itemMaterial);
    itemMesh.castShadow = true;
    itemGroup.add(itemMesh);

    // Glowing circle ring below
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.6, 16),
      new THREE.MeshBasicMaterial({ color: '#f43f5e', side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.79;
    itemGroup.add(ring);

    engine.scene.add(itemGroup);
    engine.collectibles.push({
      mesh: itemGroup,
      type: 'mask',
      scoreValue: 150,
      healthValue: 1, // restores 1 life hit
      energyValue: 20
    });

    // Spawn mini alert fireworks
    spawnFlashParticles(new THREE.Vector3(x, 0.8, z), new THREE.Color('#f43f5e'), 8);
  };

  // Periodic random item falling from the sky
  const spawnRandomItem = (isInitial: boolean = false) => {
    const engine = engineRef.current;
    if (!engine) return;

    // Pick random coordinate avoiding temple center (radius 4.5)
    let x = 0;
    let z = 0;
    let valid = false;
    let attempts = 0;
    while (!valid && attempts < 20) {
      x = Math.random() * 44 - 22;
      z = Math.random() * 44 - 22;
      const distToCenter = Math.sqrt(x * x + z * z);
      if (distToCenter > 4.5) {
        valid = true;
      }
      attempts++;
    }

    const itemGroup = new THREE.Group();
    // If falling, start high in the sky (Y = 15)
    const startY = isInitial ? 0.8 : 15;
    itemGroup.position.set(x, startY, z);

    // Create the 2D Plane with item.png
    const itemMesh = new THREE.Mesh(engine.itemGeo, engine.itemMaterial);
    itemMesh.castShadow = true;
    itemGroup.add(itemMesh);

    // Glowing circle ring below on the ground (always at ground level Y = 0.01)
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.6, 16),
      new THREE.MeshBasicMaterial({ color: '#f43f5e', side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -startY + 0.05; // place on ground
    itemGroup.add(ring);

    engine.scene.add(itemGroup);
    engine.collectibles.push({
      mesh: itemGroup,
      type: 'mask',
      scoreValue: 150,
      healthValue: 1, // Restores 1 life / hit
      energyValue: 20,
      yVelocity: isInitial ? 0 : -15, // falling speed
      isLanding: !isInitial
    } as any);

    if (!isInitial) {
      // Small flash in the sky on spawn
      spawnFlashParticles(new THREE.Vector3(x, 15, z), new THREE.Color('#f43f5e'), 6);
    }
  };

  // Particle Generators
  const spawnFlashParticles = (pos: THREE.Vector3, color: THREE.Color, count: number) => {
    const engine = engineRef.current;
    if (!engine) return;

    const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);

    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1.0
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);

      // Random spherical velocity
      const angle = Math.random() * Math.PI * 2;
      const pitch = Math.random() * Math.PI - Math.PI / 2;
      const speed = 1.5 + Math.random() * 3.5;

      const velocity = new THREE.Vector3(
        Math.cos(angle) * Math.cos(pitch) * speed,
        Math.sin(pitch) * speed + 2.0, // bias upward
        Math.sin(angle) * Math.cos(pitch) * speed
      );

      const life = 0.4 + Math.random() * 0.4; // 400-800ms
      engine.scene.add(mesh);
      engine.particles.push({
        mesh,
        velocity,
        life,
        maxLife: life,
        color
      });
    }
  };

  const spawnAuraWave = (pos: THREE.Vector3, color: THREE.Color) => {
    const engine = engineRef.current;
    if (!engine) return;

    // Create 60 particles expanding outwards in a flat horizontal ring
    const count = 60;
    const geo = new THREE.SphereGeometry(0.15, 6, 6);

    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.9
      });
      const mesh = new THREE.Mesh(geo, mat);
      
      const angle = (i / count) * Math.PI * 2;
      const speed = 6.0 + Math.random() * 2.0;

      mesh.position.copy(pos);
      mesh.position.y = 0.5;

      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        0.5 + Math.random() * 0.5, // slight lift
        Math.sin(angle) * speed
      );

      const life = 1.0;
      engine.scene.add(mesh);
      engine.particles.push({
        mesh,
        velocity,
        life,
        maxLife: life,
        color
      });
    }
  };

  // HTML Floating Texts overlay management
  const spawnFloatingText = (text: string, x: number, y: number, z: number, color: string) => {
    if (!uiOverlayRef.current) return;

    const el = document.createElement('div');
    el.className = 'absolute select-none pointer-events-none font-bold text-sm text-center font-sans drop-shadow-lg transition-all duration-300 transform scale-100 whitespace-nowrap';
    el.style.color = color;
    el.style.textShadow = '2px 2px 0px #000';
    el.innerText = text;

    uiOverlayRef.current.appendChild(el);

    if (engineRef.current) {
      engineRef.current.floatingTexts.push({
        element: el,
        x, y, z,
        life: 1.0 // 1 second life
      });
    }
  };

  // Game Win state
  const triggerGameWin = () => {
    setIsGameWon(true);
    audio.playWin();
    
    // Spawn infinite gold fireworks in center
    const engine = engineRef.current;
    if (engine) {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          if (!engine) return;
          spawnFlashParticles(
            new THREE.Vector3(Math.random() * 10 - 5, 2, Math.random() * 10 - 5),
            new THREE.Color('#eab308'),
            25
          );
        }, i * 600);
      }
    }
  };

  // Periodic item falling from sky
  useEffect(() => {
    if (isDead || isGameWon || isPaused) return;

    const interval = setInterval(() => {
      const engine = engineRef.current;
      if (engine && engine.collectibles.length < 15) {
        spawnRandomItem(false);
      }
    }, 6500); // Spawn every 6.5 seconds

    return () => clearInterval(interval);
  }, [isDead, isGameWon, isPaused]);

  // Run ThreeJS loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);

      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Restrict high dt spikes
      const delta = Math.min(dt, 0.1);

      const engine = engineRef.current;
      if (!engine || isDead || isGameWon) return;

      if (isPaused) {
        // Render static scene and return early to freeze updates
        engine.renderer.render(engine.scene, engine.camera);
        return;
      }

      // 1. Controls processing & Movement physics
      let moveX = 0;
      let moveZ = 0;

      if (activeKeys.w || activeKeys.ArrowUp) moveZ -= 1;
      if (activeKeys.s || activeKeys.ArrowDown) moveZ += 1;
      if (activeKeys.a || activeKeys.ArrowLeft) moveX -= 1;
      if (activeKeys.d || activeKeys.ArrowRight) moveX += 1;

      // Apply character specific speeds and modifiers
      const baseSpeed = character.speed * 1.5;
      let finalSpeed = baseSpeed;

      // Handle custom animations row overrides
      if (engine.attackTimer > 0) {
        engine.attackTimer -= delta;
        finalSpeed *= 0.2; // slow down during attacks
        if (engine.attackTimer <= 0) {
          engine.animationRow = 0; // return to idle
        }
      } else if (engine.danceTimer > 0) {
        engine.danceTimer -= delta;
        finalSpeed = 0; // frozen during powerful ritual dance
        if (engine.danceTimer <= 0) {
          engine.animationRow = 0; // return to idle
        }
      } else {
        // Normal movement animations
        if (moveX !== 0 || moveZ !== 0) {
          engine.animationRow = 1; // Walk
          
          // Determine horizontal flip based on movement direction
          if (moveX < 0) {
            engine.facingLeft = true;
          } else if (moveX > 0) {
            engine.facingLeft = false;
          }
        } else {
          engine.animationRow = 0; // Idle
        }
      }

      // 8-directional movement normalization
      if (moveX !== 0 && moveZ !== 0) {
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        moveX /= length;
        moveZ /= length;
      }

      // Physics Move
      engine.playerX += moveX * finalSpeed * delta;
      engine.playerZ += moveZ * finalSpeed * delta;

      // Boundaries clamp (radius 23 to avoid hitting fence posts)
      const distFromCenter = Math.sqrt(engine.playerX * engine.playerX + engine.playerZ * engine.playerZ);
      if (distFromCenter > 23.5) {
        const angle = Math.atan2(engine.playerZ, engine.playerX);
        engine.playerX = Math.cos(angle) * 23.5;
        engine.playerZ = Math.sin(angle) * 23.5;
      }

      // Prevent walking through Temple Shrine pillars or base
      const distToTemple = Math.sqrt(engine.playerX * engine.playerX + engine.playerZ * engine.playerZ);
      if (distToTemple < 3.2) {
        // Push back
        const angle = Math.atan2(engine.playerZ, engine.playerX);
        engine.playerX = Math.cos(angle) * 3.2;
        engine.playerZ = Math.sin(angle) * 3.2;
      }

      // Update actual mesh coordinates
      engine.playerMesh.position.x = engine.playerX;
      engine.playerMesh.position.z = engine.playerZ;

      // Sync character position state for radar
      setPlayerPos({ x: engine.playerX, z: engine.playerZ });

      // Handle gravity/jumping (standard spacebar or custom jump control)
      const controls = settings.controls;
      const wantsJump = activeKeys.w || activeKeys.ArrowUp; // standard jump fallback or mapped key
      
      // Let's implement active Jump button or automatic jumping on fences
      if (engine.isGrounded) {
        engine.playerVelocityY = 0;
      } else {
        // Gravity
        engine.playerVelocityY -= 9.8 * 2.5 * delta;
        engine.playerMesh.position.y += engine.playerVelocityY * delta;

        if (engine.playerMesh.position.y <= 1.2) {
          engine.playerMesh.position.y = 1.2;
          engine.isGrounded = true;
        }
      }

      // 2. Sprite frame animator
      engine.animationTimer += delta;
      const frameSpeed = engine.animationRow === 3 ? 0.08 : 0.15; // dance faster, idle slower
      
      if (engine.animationTimer >= frameSpeed) {
        engine.animationTimer = 0;
        engine.currentFrame = (engine.currentFrame + 1) % 4;

        // Apply texture crop offset
        // X Offset: frame index
        engine.playerTexture.offset.x = engine.currentFrame * 0.25;
        
        // Y Offset: Row selection (Idle = 3, Walk = 2, Attack = 1, Dance = 0)
        // Row 0 is at top: offset.y = 0.75
        // Row 1: offset.y = 0.50
        // Row 2: offset.y = 0.25
        // Row 3: offset.y = 0.00
        engine.playerTexture.offset.y = 1.0 - (engine.animationRow + 1) * 0.25;

        // Handle mirror texture flipping depending on facing left or right
        if (engine.facingLeft) {
          engine.playerTexture.repeat.x = -0.25; // mirror texture
          // when flipping x, we must shift offset to the next frame block to preserve alignment
          engine.playerTexture.offset.x = (engine.currentFrame + 1) * 0.25;
        } else {
          engine.playerTexture.repeat.x = 0.25;
        }
      }

      // Rotate player billboard slightly towards camera or keep completely facing camera
      // Standard camera angle is 18 degree pitch, so tilt the sprite back slightly for best 3D look
      engine.playerMesh.rotation.set(0.18, 0, 0);

      // 3. Smooth Camera following tracking
      const targetCamX = engine.playerX;
      const targetCamZ = engine.playerZ + 12; // offset behind player
      const targetCamY = 11; // height

      // LERP camera
      engine.camera.position.x += (targetCamX - engine.camera.position.x) * 4.0 * delta;
      engine.camera.position.z += (targetCamZ - engine.camera.position.z) * 4.0 * delta;
      engine.camera.position.y += (targetCamY - engine.camera.position.y) * 4.0 * delta;
      engine.camera.lookAt(engine.playerX, 0.8, engine.playerZ - 1.5);

      // 4. Animate collectibles (spin, float up/down, or fall)
      engine.collectibles.forEach(item => {
        // Face camera slightly (0.18 pitch) and spin Y
        item.mesh.rotation.set(0.18, item.mesh.rotation.y + 1.8 * delta, 0);

        // If falling from sky
        if (item.yVelocity && item.mesh.position.y > 0.8) {
          item.mesh.position.y += item.yVelocity * delta;
          // Update the ring position to stay on ground
          const ringMesh = item.mesh.children[1];
          if (ringMesh) {
            ringMesh.position.y = -item.mesh.position.y + 0.01;
          }

          if (item.mesh.position.y <= 0.8) {
            item.mesh.position.y = 0.8;
            item.yVelocity = 0;
            item.isLanding = false;
            // Spawn landing dust particles on ground
            spawnFlashParticles(new THREE.Vector3(item.mesh.position.x, 0.1, item.mesh.position.z), new THREE.Color('#f43f5e'), 10);
            audio.playCollect(); // small landing chime
          }
        } else {
          // Normal float on ground
          item.mesh.position.y = 0.8 + Math.sin(now * 0.003 + item.mesh.position.x) * 0.15;
          const ringMesh = item.mesh.children[1];
          if (ringMesh) {
            ringMesh.position.y = -item.mesh.position.y + 0.01;
          }
        }

        // Collision check with player
        const dist = item.mesh.position.distanceTo(engine.playerMesh.position);
        if (dist < 1.8) {
          // Collect item!
          setScore(prev => prev + item.scoreValue);
          setLives(prev => Math.min(5, prev + item.healthValue));
          setEnergy(prev => Math.min(100, prev + item.energyValue));

          audio.playCollect();

          // Spark particles
          const color = '#f43f5e';
          spawnFlashParticles(item.mesh.position, new THREE.Color(color), 15);

          // Spawn Floating combat text
          const txt = `+1 LIFE ❤️ (+150 PTS)`;
          spawnFloatingText(txt, item.mesh.position.x, item.mesh.position.y + 1.2, item.mesh.position.z, color);

          // Remove item from scene
          engine.scene.remove(item.mesh);
          engine.collectibles = engine.collectibles.filter(i => i !== item);
        }
      });

      // 5a. Ground/grass deformation under player movement
      engine.grassEntities.forEach(grass => {
        const dx = engine.playerX - grass.x;
        const dz = engine.playerZ - grass.z;
        const distSq = dx * dx + dz * dz;

        if (distSq < 1.44) { // Player is within ~1.2 units
          grass.targetScaleY = 0.15; // Flatten Y down scale (trampled flat!)
        } else {
          // Gentle organic wind sway on scale to make the scene alive!
          const windSway = 1.0 + Math.sin(now * 0.0035 + grass.x * 2.0 + grass.z * 1.5) * 0.07;
          grass.targetScaleY = windSway * grass.baseScaleY;
        }

        // Smoothly interpolate the scale of the grass parent group on the Y axis
        grass.group.scale.y += (grass.targetScaleY - grass.group.scale.y) * 12.0 * delta;
      });

      // 5b. Update and AI behavior for Ghosts
      engine.ghosts.forEach(ghost => {
        const playerVec = new THREE.Vector3(engine.playerX, 1.0, engine.playerZ);
        const ghostDistToPlayer = ghost.mesh.position.distanceTo(playerVec);

        // --- A. Handle Dying state (Spin and fly out of scene) ---
        if (ghost.isDying) {
          ghost.dieTimer -= delta;

          // Spin rapidly around Z/Y axis
          ghost.mesh.rotation.z += 16.0 * delta;
          ghost.mesh.rotation.y += 6.0 * delta;

          // Fly backwards and upwards
          ghost.mesh.position.x += ghost.dieVelocityX * delta;
          ghost.mesh.position.z += ghost.dieVelocityZ * delta;
          ghost.mesh.position.y += 13.0 * delta; // Fly up high

          // Rapid white blink effect: alternate opacity between 0.1 and 1.0
          ghost.spriteMaterial.color.set('#ffffff'); // force white tint
          ghost.spriteMaterial.opacity = (Math.floor(now / 40) % 2 === 0) ? 1.0 : 0.08;

          if (ghost.dieTimer <= 0) {
            // Clean up and remove ghost completely
            engine.scene.remove(ghost.mesh);
            ghost.ghostTexture.dispose();
            ghost.spriteMaterial.dispose();
            
            // Remove from list
            engine.ghosts = engine.ghosts.filter(g => g !== ghost);
            
            // Re-calculate remaining ghosts
            const remainingCount = engine.ghosts.filter(g => !g.isDying).length;
            setGhostsRemaining(remainingCount);

            if (remainingCount === 0) {
              triggerGameWin();
            }
          }
          return; // Skip normal AI and collisions
        }

        // --- B. Simple billboard rotation towards camera ---
        ghost.mesh.rotation.set(0.18, 0, 0);

        // --- C. Timers, flashes & Color updates ---
        if (ghost.flashTimer > 0) {
          ghost.flashTimer -= delta;
        }
        if (ghost.attackFlashTimer > 0) {
          ghost.attackFlashTimer -= delta;
        }

        // Set sprite material color/tint
        if (ghost.flashTimer > 0 && ghost.attackFlashTimer <= 0) {
          // Hurt state: flash solid white
          ghost.spriteMaterial.color.set('#ffffff');
        } else if (ghost.attackFlashTimer > 0) {
          // Attacking state: blink bright red and white rapidly
          const isRed = Math.floor(now / 80) % 2 === 0;
          ghost.spriteMaterial.color.set(isRed ? '#ff0000' : '#ffffff');
        } else if (ghost.isStunned && ghost.isDancing) {
          // Dancing pacified state: soft glow pink tint
          ghost.spriteMaterial.color.set('#fb7185');
        } else {
          // Normal state: reset to original bright colors
          ghost.spriteMaterial.color.set('#ffffff');
        }

        // --- D. Is Stunned/Dancing AI behavior ---
        if (ghost.isStunned) {
          ghost.stunTimer -= delta;
          
          // Float up and down joyfully
          ghost.mesh.position.y = 1.0 + Math.sin(now * 0.01) * 0.4;

          // Animate on the Idle row
          ghost.animTimer += delta;
          if (ghost.animTimer >= 0.12) {
            ghost.animTimer = 0;
            ghost.currentFrame = (ghost.currentFrame + 1) % 4;
          }
          ghost.ghostTexture.offset.y = 0.5; // Row 1: Idle
          ghost.ghostTexture.offset.x = ghost.currentFrame * 0.25;
          
          if (ghost.stunTimer <= 0) {
            ghost.isStunned = false;
            ghost.isDancing = false;
          }
          return; // Skip standard chase/wandering movement
        }

        // --- E. Normal wandering and Player tracking movement ---
        ghost.mesh.position.y = 1.0 + Math.sin(now * 0.005 + ghost.mesh.position.x) * 0.15;
        ghost.directionTimer -= delta;

        let moveX = 0;
        let moveZ = 0;

        if (ghost.knockbackTimer && ghost.knockbackTimer > 0) {
          // Slide backwards smoothly under knockback
          ghost.knockbackTimer -= delta;
          moveX = ghost.knockbackX || 0;
          moveZ = ghost.knockbackZ || 0;

          ghost.mesh.position.x += moveX * delta;
          ghost.mesh.position.z += moveZ * delta;

          // Decelerate knockback velocity
          ghost.knockbackX = (ghost.knockbackX || 0) * 0.88;
          ghost.knockbackZ = (ghost.knockbackZ || 0) * 0.88;
        } else if (ghostDistToPlayer < 7.5) {
          // Aggressively chase player
          const chaseDir = new THREE.Vector3().subVectors(playerVec, ghost.mesh.position).normalize();
          moveX = chaseDir.x * ghost.speed * 0.9;
          moveZ = chaseDir.z * ghost.speed * 0.9;
          
          ghost.mesh.position.x += moveX * delta;
          ghost.mesh.position.z += moveZ * delta;
        } else {
          // Random wander
          if (ghost.directionTimer <= 0) {
            ghost.directionTimer = 1.5 + Math.random() * 2.0;
            ghost.dirX = Math.random() * 2 - 1;
            ghost.dirZ = Math.random() * 2 - 1;
            
            const len = Math.sqrt(ghost.dirX * ghost.dirX + ghost.dirZ * ghost.dirZ);
            if (len > 0) {
              ghost.dirX /= len;
              ghost.dirZ /= len;
            }
          }
          moveX = ghost.dirX * ghost.speed * 0.5;
          moveZ = ghost.dirZ * ghost.speed * 0.5;

          ghost.mesh.position.x += moveX * delta;
          ghost.mesh.position.z += moveZ * delta;
        }

        // --- F. Animation frame update & scaling (Horizontal flipping) ---
        ghost.animTimer += delta;
        if (ghost.animTimer >= 0.12) {
          ghost.animTimer = 0;
          ghost.currentFrame = (ghost.currentFrame + 1) % 4;
        }

        const isMoving = Math.abs(moveX) > 0.01 || Math.abs(moveZ) > 0.01;
        ghost.ghostTexture.offset.y = isMoving ? 0.0 : 0.5; // Row 2 Walk (0.0), Row 1 Idle (0.5)
        ghost.ghostTexture.offset.x = ghost.currentFrame * 0.25;
        ghost.ghostTexture.repeat.x = 0.25; // Keep texture repeat constant

        // Face left/right (Flip sprite mesh scale.x based on movement direction)
        const gMesh = ghost.mesh.children[0];
        if (gMesh) {
          if (moveX > 0.01) {
            gMesh.scale.x = -1.0; // flip to face right
          } else if (moveX < -0.01) {
            gMesh.scale.x = 1.0; // face left (default)
          }
        }

        // --- G. Stage and Shrine boundary checks ---
        const gCenterDist = Math.sqrt(ghost.mesh.position.x * ghost.mesh.position.x + ghost.mesh.position.z * ghost.mesh.position.z);
        if (gCenterDist > 23.5) {
          const gAngle = Math.atan2(ghost.mesh.position.z, ghost.mesh.position.x);
          ghost.mesh.position.x = Math.cos(gAngle) * 23.5;
          ghost.mesh.position.z = Math.sin(gAngle) * 23.5;
          ghost.directionTimer = 0; // recalculate route
        }

        const gTempleDist = Math.sqrt(ghost.mesh.position.x * ghost.mesh.position.x + ghost.mesh.position.z * ghost.mesh.position.z);
        if (gTempleDist < 3.2) {
          const gAngle = Math.atan2(ghost.mesh.position.z, ghost.mesh.position.x);
          ghost.mesh.position.x = Math.cos(gAngle) * 3.2;
          ghost.mesh.position.z = Math.sin(gAngle) * 3.2;
          ghost.directionTimer = 0;
        }

        // --- H. Touch collision with player (Hurts player & flashes red) ---
        if (ghostDistToPlayer < 1.4 && ghost.flashTimer <= 0) {
          ghost.flashTimer = 1.0; // general hit/damage cooldown
          ghost.attackFlashTimer = 0.5; // active flash red duration for attack animation

          setLives(prev => {
            const nextLives = Math.max(0, prev - 1);
            audio.playHurt();
            spawnFloatingText('-1 LIFE 💥', engine.playerX, 2.5, engine.playerZ, '#ef4444');
            
            // Red damage indicator flash overlay
            const damageIndicator = document.createElement('div');
            damageIndicator.className = 'absolute inset-0 bg-red-600/30 pointer-events-none transition-opacity duration-300 opacity-100 z-50';
            if (uiOverlayRef.current) {
              uiOverlayRef.current.appendChild(damageIndicator);
              setTimeout(() => damageIndicator.remove(), 250);
            }

            if (nextLives <= 0) {
              setIsDead(true);
              audio.playGameOver();
            }
            return nextLives;
          });
        }
      });

      // 6. Update particles
      engine.particles.forEach(p => {
        p.life -= delta;
        p.mesh.position.addScaledVector(p.velocity, delta);
        
        // fade opacity
        const mat = p.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = p.life / p.maxLife;

        if (p.life <= 0) {
          engine.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          mat.dispose();
          engine.particles = engine.particles.filter(item => item !== p);
        }
      });

      // 7. Update floating labels (screen projection)
      engine.floatingTexts.forEach(ft => {
        ft.life -= delta;
        
        // Rise up slowly
        ft.y += 1.8 * delta;

        // Project 3D coordinate to 2D Screen Space
        const vector = new THREE.Vector3(ft.x, ft.y, ft.z);
        vector.project(engine.camera);

        const screenX = (vector.x * 0.5 + 0.5) * engine.renderer.domElement.clientWidth;
        const screenY = (-(vector.y * 0.5) + 0.5) * engine.renderer.domElement.clientHeight;

        ft.element.style.left = `${screenX}px`;
        ft.element.style.top = `${screenY}px`;
        ft.element.style.opacity = `${ft.life}`;

        if (ft.life <= 0) {
          ft.element.remove();
          engine.floatingTexts = engine.floatingTexts.filter(item => item !== ft);
        }
      });

      // 8. Render Scene
      engine.renderer.render(engine.scene, engine.camera);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      // Clean up any remaining floating elements
      const engine = engineRef.current;
      if (engine) {
        engine.floatingTexts.forEach(ft => ft.element.remove());
      }
    };
  }, [isDead, isGameWon, activeKeys, character, score, isPaused]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden font-sans" ref={containerRef}>
      {/* ThreeJS Main Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" id="game-canvas-element" />

      {/* Floating 2D Projective Text Overlay */}
      <div ref={uiOverlayRef} className="absolute inset-0 pointer-events-none overflow-hidden z-10" />

      {/* Top HUD Panel */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-20">
        {/* Left Stats Block (Health & Energy) */}
        <div className="flex flex-col gap-3 p-4 bg-black/70 backdrop-blur-md rounded-xl border border-amber-500/30 max-w-xs pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-3">
            {/* Cute mini icon of active character */}
            <div 
              className="w-10 h-10 rounded-full border-2 border-amber-400 flex items-center justify-center font-bold text-lg shadow-lg shadow-amber-500/20"
              style={{ backgroundColor: character.color }}
            >
              🎭
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-amber-300">{character.name}</div>
              <div className="text-xs text-slate-400 font-mono tracking-tight">{character.thaiName}</div>
            </div>
          </div>

          {/* Lives Indicator (5 hits) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-red-400 font-mono tracking-wider">
              <span>LIVES (พลังชีวิต)</span>
              <span>{lives} / 5</span>
            </div>
            <div className="flex gap-1.5 mt-1">
              {[1, 2, 3, 4, 5].map((index) => (
                <div 
                  key={index}
                  className={`text-xl transition-all duration-300 transform ${
                    index <= lives ? 'scale-110 opacity-100 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]' : 'scale-90 opacity-20'
                  }`}
                >
                  ❤️
                </div>
              ))}
            </div>
          </div>

          {/* Energy Bar (Bells) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-amber-300 font-mono">
              <span>พลังวิญญาณ ENERGY</span>
              <span>{energy}/100</span>
            </div>
            <div className="h-3 w-48 bg-slate-850 rounded-full overflow-hidden border border-slate-700/50">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-300 rounded-full"
                style={{ width: `${energy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Middle Title / Mission Overlay */}
        <div className="hidden md:flex flex-col items-center bg-black/60 backdrop-blur-md px-5 py-2 rounded-xl border border-purple-500/20 text-center font-mono">
          <div className="text-xs text-purple-300 tracking-wider font-semibold uppercase">ภารกิจ Dan Sai Mission</div>
          <div className="text-sm text-yellow-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            ปราบและทำให้ผีเต้นรำด้วยปุ่ม O หรือต่อยด้วย P!
          </div>
          <div className="text-xs text-slate-400 mt-1">
            ผีที่เหลืออยู่ Ghosts left: <span className="text-rose-400 font-bold text-sm">{ghostsRemaining}</span>
          </div>
        </div>

        {/* Right Score Block */}
        <div className="flex flex-col items-end gap-2 p-3 bg-black/70 backdrop-blur-md rounded-xl border border-amber-500/30 text-right pointer-events-auto shadow-2xl font-mono">
          <div className="text-xs text-slate-400 font-semibold tracking-wider">คะแนนรวม SCORE</div>
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 flex items-center gap-1.5">
            🏆 {score}
          </div>
          <button 
            onClick={onExit}
            className="mt-1 flex items-center gap-1 text-xs px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> ออกเมนู Exit
          </button>
        </div>
      </div>

      {/* Mini Radar Map / Compass (Bottom Left) */}
      <div className="absolute bottom-6 left-6 p-3 bg-black/80 backdrop-blur-md rounded-2xl border border-amber-500/20 pointer-events-none z-20 flex flex-col items-center shadow-xl">
        <div className="text-xs text-slate-400 font-mono mb-1.5 font-bold">แผนที่วัด Wat Radar</div>
        <div className="relative w-28 h-28 bg-slate-950/80 rounded-full border border-slate-700/60 overflow-hidden flex items-center justify-center">
          {/* Shrine indicator (Center) */}
          <div className="absolute w-3.5 h-3.5 bg-yellow-500 rounded-full border border-white animate-pulse flex items-center justify-center shadow-md">
            <span className="text-[6px]">⛩️</span>
          </div>

          {/* Compass grid lines */}
          <div className="absolute inset-0 border-t border-b border-slate-800/40" />
          <div className="absolute inset-0 border-l border-r border-slate-800/40" />

          {/* Player Dot */}
          <div 
            className="absolute w-2.5 h-2.5 rounded-full border border-white z-30 transition-all duration-100 shadow-lg"
            style={{ 
              backgroundColor: character.color,
              // Map -25 to 25 to pixel range 0 to 112
              left: `${((playerPos.x + 25) / 50) * 112 - 5}px`,
              bottom: `${((playerPos.z + 25) / 50) * 112 - 5}px`
            }}
          />

          {/* Ghost Dots */}
          {engineRef.current?.ghosts.map((ghost, idx) => (
            <div 
              key={idx}
              className="absolute w-2 h-2 bg-purple-500 rounded-full border border-purple-200 z-10 animate-pulse"
              style={{
                left: `${((ghost.mesh.position.x + 25) / 50) * 112 - 4}px`,
                bottom: `${((ghost.mesh.position.z + 25) / 50) * 112 - 4}px`
              }}
            />
          ))}

          {/* Collectible item dots */}
          {engineRef.current?.collectibles.map((item, idx) => (
            <div 
              key={idx}
              className="absolute w-1.5 h-1.5 rounded-full z-10"
              style={{
                backgroundColor: item.type === 'mask' ? '#f43f5e' : item.type === 'kratip' ? '#10b981' : '#fbbf24',
                left: `${((item.mesh.position.x + 25) / 50) * 112 - 3}px`,
                bottom: `${((item.mesh.position.z + 25) / 50) * 112 - 3}px`
              }}
            />
          ))}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-1">
          พิกัด Pos: X:{Math.round(playerPos.x)}, Z:{Math.round(playerPos.z)}
        </div>
      </div>

      {/* On-screen Mobile Controller (Joystick & Action Buttons) */}
      <div className="absolute bottom-6 right-6 flex items-end gap-16 pointer-events-none z-20">
        {/* Virtual Joystick for Mobile WASD */}
        <div className="p-3 bg-black/60 backdrop-blur-md rounded-2xl border border-slate-700/40 pointer-events-auto flex flex-col items-center">
          <div className="grid grid-cols-3 gap-1.5">
            <div />
            <button 
              onMouseDown={() => setActiveKeys(prev => ({ ...prev, w: true }))}
              onMouseUp={() => setActiveKeys(prev => ({ ...prev, w: false }))}
              onTouchStart={() => setActiveKeys(prev => ({ ...prev, w: true }))}
              onTouchEnd={() => setActiveKeys(prev => ({ ...prev, w: false }))}
              className={`w-12 h-12 flex items-center justify-center bg-slate-800/80 active:bg-amber-500 rounded-xl border border-slate-600 text-white font-bold text-lg select-none transition-colors cursor-pointer ${activeKeys.w ? 'bg-amber-500' : ''}`}
            >
              ▲
            </button>
            <div />

            <button 
              onMouseDown={() => setActiveKeys(prev => ({ ...prev, a: true }))}
              onMouseUp={() => setActiveKeys(prev => ({ ...prev, a: false }))}
              onTouchStart={() => setActiveKeys(prev => ({ ...prev, a: true }))}
              onTouchEnd={() => setActiveKeys(prev => ({ ...prev, a: false }))}
              className={`w-12 h-12 flex items-center justify-center bg-slate-800/80 active:bg-amber-500 rounded-xl border border-slate-600 text-white font-bold text-lg select-none transition-colors cursor-pointer ${activeKeys.a ? 'bg-amber-500' : ''}`}
            >
              ◀
            </button>
            <button 
              onMouseDown={() => setActiveKeys(prev => ({ ...prev, s: true }))}
              onMouseUp={() => setActiveKeys(prev => ({ ...prev, s: false }))}
              onTouchStart={() => setActiveKeys(prev => ({ ...prev, s: true }))}
              onTouchEnd={() => setActiveKeys(prev => ({ ...prev, s: false }))}
              className={`w-12 h-12 flex items-center justify-center bg-slate-800/80 active:bg-amber-500 rounded-xl border border-slate-600 text-white font-bold text-lg select-none transition-colors cursor-pointer ${activeKeys.s ? 'bg-amber-500' : ''}`}
            >
              ▼
            </button>
            <button 
              onMouseDown={() => setActiveKeys(prev => ({ ...prev, d: true }))}
              onMouseUp={() => setActiveKeys(prev => ({ ...prev, d: false }))}
              onTouchStart={() => setActiveKeys(prev => ({ ...prev, d: true }))}
              onTouchEnd={() => setActiveKeys(prev => ({ ...prev, d: false }))}
              className={`w-12 h-12 flex items-center justify-center bg-slate-800/80 active:bg-amber-500 rounded-xl border border-slate-600 text-white font-bold text-lg select-none transition-colors cursor-pointer ${activeKeys.d ? 'bg-amber-500' : ''}`}
            >
              ▶
            </button>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1 font-bold">ปุ่มบังคับ MOVEMENT</div>
        </div>

        {/* Action Buttons: P (Punch) and O (Dance Skill) */}
        <div className="flex gap-4 pointer-events-auto">
          {/* O Key: Dance Skill */}
          <button 
            onClick={triggerDanceSkill}
            disabled={energy < 15 || skillCooldown > 0}
            className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center text-white font-bold shadow-2xl relative select-none cursor-pointer transition-all ${
              energy >= 15 && skillCooldown === 0 
              ? 'bg-purple-700/90 hover:bg-purple-600 border-purple-400 active:scale-95' 
              : 'bg-purple-950/60 border-purple-900/40 opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="text-xl">O</span>
            <span className="text-[10px] tracking-tight">เต้นรำ DANCE</span>
            {skillCooldown > 0 && (
              <span className="absolute inset-0 bg-black/80 rounded-full flex items-center justify-center text-lg font-mono text-amber-400 font-bold">
                {skillCooldown}s
              </span>
            )}
            <div className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black font-extrabold text-[9px] px-1.5 rounded-full border border-black shadow">
              ใช้ 15
            </div>
          </button>

          {/* P Key: Punch Attack */}
          <button 
            onClick={triggerAttack}
            className="w-16 h-16 rounded-full bg-rose-600/90 hover:bg-rose-500 active:scale-95 border-2 border-rose-400 flex flex-col items-center justify-center text-white font-bold shadow-2xl select-none cursor-pointer transition-all"
          >
            <span className="text-xl">P</span>
            <span className="text-[10px] tracking-tight">โจมตี ATTACK</span>
          </button>
        </div>
      </div>

      {/* Screen Game Won Banner Modal */}
      {isGameWon && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 animate-fade-in font-sans">
          <div className="p-8 bg-gradient-to-b from-slate-900 to-black rounded-3xl border-2 border-yellow-400 text-center max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-yellow-500" />
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-3xl font-black text-yellow-400 mb-1">ชัยชนะแดนซ้าย!</h2>
            <p className="text-lg text-slate-300 font-mono mb-4">VICTORY IN DAN SAI</p>
            
            <div className="p-4 bg-slate-900/80 rounded-xl border border-amber-500/20 mb-6 font-mono space-y-2">
              <p className="text-sm text-slate-400">คุณสามารถทำให้ผีเต้นรำและปราบผีจิตวิญญาณได้ทั้งหมด!</p>
              <div className="text-2xl font-black text-amber-400 mt-2">
                คะแนนรวม: {score}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => onGameOver(score, 'ผู้กล้าแดนซ้าย')}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 font-bold rounded-xl text-black transition-all cursor-pointer shadow-lg"
              >
                บันทึกคะแนน RECORD SCORE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Popup Modal */}
      {isDead && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 animate-fade-in font-sans">
          <div className="p-8 bg-zinc-950 rounded-2xl border-2 border-red-600 text-center max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-red-600 animate-pulse" />
            <div className="text-6xl mb-4 animate-bounce">💀</div>
            <h2 className="text-3xl font-black text-red-500 mb-1 uppercase tracking-tighter italic">GAME OVER</h2>
            <p className="text-sm text-zinc-400 font-mono mb-4 uppercase tracking-wider">พลังชีวิตหมดลงแล้ว (No Lives Left)</p>
            
            <div className="p-5 bg-zinc-900/60 rounded-xl border border-zinc-800 mb-6 font-mono space-y-3 text-center">
              <p className="text-xs text-zinc-500">คุณทำคะแนนรักษางานบุญหลวงได้:</p>
              <div className="text-3xl font-black text-white">
                ★ {score}
              </div>
            </div>

            <div className="space-y-2 text-left mb-6">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">กรอกชื่อของคุณ (ENTER NAME)</label>
              <input 
                type="text" 
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value.slice(0, 15))}
                placeholder="ชื่อของคุณ..."
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded font-sans text-white font-bold focus:outline-none focus:border-red-600 transition-colors text-center text-sm uppercase"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  audio.playSelect();
                  onGameOver(score, playerNameInput);
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-sm tracking-widest transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-100 rounded"
              >
                SUBMIT & RETURN TO LOBBY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Paused Overlay Modal */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 animate-fade-in font-sans">
          <div className="p-8 bg-zinc-950 rounded-2xl border-2 border-zinc-800 text-center max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-zinc-700" />
            <div className="text-6xl mb-4 animate-pulse">⏸️</div>
            <h2 className="text-3xl font-black text-white mb-1 uppercase tracking-tighter italic">GAME PAUSED</h2>
            <p className="text-xs text-zinc-500 font-mono mb-6 uppercase tracking-wider">เกมหยุดชั่วคราว (Press ESC to Resume)</p>
            
            <div className="space-y-3 font-sans">
              <button 
                onClick={() => {
                  audio.playSelect();
                  setIsPaused(false);
                }}
                className="w-full py-3 bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs tracking-widest transition-all cursor-pointer rounded"
              >
                RESUME ADVENTURE
              </button>
              
              <button 
                onClick={() => {
                  audio.playSelect();
                  onExit();
                }}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-black uppercase text-xs tracking-widest transition-all cursor-pointer border border-zinc-800 rounded"
              >
                EXIT TO LOBBY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { createClayBrickTexture, createGrassTexture } from './ProceduralTextures';

// ... โค้ดส่วนอื่นๆ ของคุณ ...

// เลือกสร้าง Texture ตามที่ต้องการใช้งาน (เช่น ลายหญ้า)
const groundTexture = createGrassTexture();

// กำหนดจำนวนการวนซ้ำ (Tiling) ยิ่งตัวเลขมาก ลายจะยิ่งเล็กและละเอียดขึ้น
groundTexture.repeat.set(10, 10); 

// สร้าง Material และสวมใส่ให้กับพื้นดิน
const groundMaterial = new THREE.MeshStandardMaterial({
  map: groundTexture,
  roughness: 0.8, // ลดความเงาสะท้อนเพื่อให้ดูเป็นธรรมชาติ
});

// นำไปใส่ใน Mesh ของพื้นดิน
const groundGeo = new THREE.PlaneGeometry(50, 50);
const ground = new THREE.Mesh(groundGeo, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

import * as THREE from 'three';

/**
 * Creates a high-quality tileable ground texture resembling traditional clay bricks
 */
export function createClayBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // 1. Base color (warm clay / terra cotta)
    ctx.fillStyle = '#6e3c23';
    ctx.fillRect(0, 0, 512, 512);

    // 2. Add fine dirt and noise
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 2 + 1;
      const brightness = Math.random() * 30 - 15;
      
      ctx.fillStyle = brightness > 0 ? '#8a4f30' : '#4d2815';
      ctx.fillRect(x, y, size, size);
    }

    // 3. Draw bricks pattern (8 columns, 16 rows)
    const rows = 12;
    const cols = 6;
    const rowHeight = 512 / rows;
    const colWidth = 512 / cols;

    ctx.strokeStyle = 'rgba(20, 10, 5, 0.6)';
    ctx.lineWidth = 4;

    for (let r = 0; r <= rows; r++) {
      const y = r * rowHeight;
      // Horizontal grout line
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();

      if (r < rows) {
        // Vertical joints (staggered)
        const offset = (r % 2) * (colWidth / 2);
        for (let c = -1; c <= cols + 1; c++) {
          const x = c * colWidth + offset;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + rowHeight);
          ctx.stroke();
        }
      }
    }

    // 4. Highlight brick edges for a 3D bevel look
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    for (let r = 0; r < rows; r++) {
      const y = r * rowHeight;
      const offset = (r % 2) * (colWidth / 2);
      for (let c = -1; c <= cols + 1; c++) {
        const x = c * colWidth + offset;
        // Top-left brick highlights
        ctx.beginPath();
        ctx.moveTo(x + 2, y + rowHeight - 2);
        ctx.lineTo(x + 2, y + 2);
        ctx.lineTo(x + colWidth - 2, y + 2);
        ctx.stroke();
      }
    }

    // 5. Add moss patches (greenish overlays) at random intersections
    for (let i = 0; i < 20; i++) {
      const mx = Math.random() * 512;
      const my = Math.random() * 512;
      const r = Math.random() * 40 + 20;
      const grad = ctx.createRadialGradient(mx, my, 0, mx, my, r);
      grad.addColorStop(0, 'rgba(46, 82, 38, 0.5)');
      grad.addColorStop(0.5, 'rgba(34, 61, 28, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mx, my, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Creates a beautiful stylized grass texture with scattered flowers
 */
export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Base vibrant green
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 0, 512, 512);

    // 2. Noise & Grass blade simulation
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const length = Math.random() * 6 + 4;
      const angle = (Math.random() * 30 - 15) * Math.PI / 180;
      
      ctx.strokeStyle = Math.random() > 0.5 ? '#3a7232' : '#1e3e1a';
      ctx.lineWidth = Math.random() * 2 + 1;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.sin(angle) * length, y - Math.cos(angle) * length);
      ctx.stroke();
    }

    // 3. Scatter small traditional Thai festival floral petals (gold/yellow/red)
    for (let i = 0; i < 80; i++) {
      const px = Math.random() * 512;
      const py = Math.random() * 512;
      const size = Math.random() * 3 + 2;
      const colors = ['#f59e0b', '#ef4444', '#f43f5e', '#ffffff'];
      
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add a small golden center
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(px, py, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

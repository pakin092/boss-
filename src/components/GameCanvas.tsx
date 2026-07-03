// ============================================================================
// [ระบบต่อเนื่องจากส่วนแรก] - ภาคจบของ GameCanvas.tsx
// ============================================================================

    const el = document.createElement('div');
    el.innerText = text;
    el.style.position = 'absolute';
    el.style.color = color;
    el.style.fontWeight = 'bold';
    el.style.fontSize = '16px';
    el.style.fontFamily = 'sans-serif';
    el.style.textShadow = '2px 2px 0px #000';
    el.style.pointerEvents = 'none';
    el.style.transition = 'opacity 0.2s ease-out';
    el.style.whiteSpace = 'nowrap';
    
    if (uiOverlayRef.current) {
      uiOverlayRef.current.appendChild(el);
    }

    if (engineRef.current) {
      engineRef.current.floatingTexts.push({
        element: el,
        x, y, z,
        life: 1.0 // มีอายุ 1 วินาที
      });
    }
  };

  // 12. Main Game Update Loop (เรียกใช้ภายใน RequestAnimationFrame)
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const gameLoop = (now: number) => {
      animationFrameId = requestAnimationFrame(gameLoop);

      const engine = engineRef.current;
      if (!engine || isPaused || isDead || !gameStarted) return;

      const delta = Math.min((now - lastTime) / 1000, 0.1); // Cap delta เพื่อป้องกันบัคเฟรมตก
      lastTime = now;

      // --- 1. Player Movement & Physics ---
      let moveX = 0;
      let moveZ = 0;
      const moveSpeed = 8.0;

      if (activeKeys.a || activeKeys.ArrowLeft) moveX = -1;
      if (activeKeys.d || activeKeys.ArrowRight) moveX = 1;
      if (activeKeys.w || activeKeys.ArrowUp) moveZ = -1;
      if (activeKeys.s || activeKeys.ArrowDown) moveZ = 1;

      if (moveX < 0) engine.facingLeft = true;
      if (moveX > 0) engine.facingLeft = false;

      if (moveX !== 0 || moveZ !== 0) {
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        engine.playerX += (moveX / length) * moveSpeed * delta;
        engine.playerZ += (moveZ / length) * moveSpeed * delta;

        if (engine.attackTimer <= 0 && engine.danceTimer <= 0) {
          engine.animationRow = 1;
        }
      } else {
        if (engine.attackTimer <= 0 && engine.danceTimer <= 0) {
          engine.animationRow = 0;
        }
      }

      // จำกัดขอบเขตผู้เล่น (Boundary รัศมี 23.5)
      const distFromCenter = Math.sqrt(engine.playerX * engine.playerX + engine.playerZ * engine.playerZ);
      if (distFromCenter > 23.5) {
        const angle = Math.atan2(engine.playerZ, engine.playerX);
        engine.playerX = Math.cos(angle) * 23.5;
        engine.playerZ = Math.sin(angle) * 23.5;
      }

      engine.playerMesh.position.set(engine.playerX, 1.2, engine.playerZ);
      setPlayerPos({ x: engine.playerX, z: engine.playerZ });

      // --- 2. Sprite Animation Sheet Math ---
      engine.animationTimer += delta;
      const frameDuration = engine.animationRow === 2 ? 0.05 : 0.15; 

      if (engine.animationTimer >= frameDuration) {
        engine.animationTimer = 0;
        engine.currentFrame = (engine.currentFrame + 1) % 4;
      }

      if (engine.attackTimer > 0) engine.attackTimer -= delta;
      if (engine.danceTimer > 0) engine.danceTimer -= delta;

      const offsetX = engine.currentFrame * 0.25;
      const offsetY = (3 - engine.animationRow) * 0.25;
      engine.playerTexture.offset.set(offsetX, offsetY);
      engine.playerTexture.repeat.set(engine.facingLeft ? -0.25 : 0.25, 0.25);

      // --- 3. Camera Smooth Follow (Isometric Look) ---
      const targetCamX = engine.playerX;
      const targetCamZ = engine.playerZ + 18;
      camera.position.x += (targetCamX - camera.position.x) * 0.1;
      camera.position.z += (targetCamZ - camera.position.z) * 0.1;
      camera.lookAt(engine.playerX, 0, engine.playerZ);

      // --- 4. Update Ghosts (ลูปถอยหลังเพื่อรองรับการลบออบเจกต์ที่ปลอดภัย) ---
      let remaining = 0;
      for (let i = engine.ghosts.length - 1; i >= 0; i--) {
        const ghost = engine.ghosts[i];
        
        if (ghost.isDying) {
          ghost.dieTimer -= delta;
          ghost.mesh.position.x += ghost.dieVelocityX * delta;
          ghost.mesh.position.z += ghost.dieVelocityZ * delta;
          ghost.mesh.position.y += 15.0 * delta;
          ghost.mesh.rotation.y += 10 * delta;
          if (ghost.dieTimer <= 0) {
            engine.scene.remove(ghost.mesh);
            engine.ghosts.splice(i, 1);
          }
          continue;
        }

        remaining++;

        if (ghost.flashTimer > 0) ghost.flashTimer -= delta;
        if (ghost.attackFlashTimer > 0) ghost.attackFlashTimer -= delta;

        if (ghost.isStunned) {
          ghost.stunTimer -= delta;
          if (ghost.stunTimer <= 0) {
            ghost.isStunned = false;
            ghost.isDancing = false;
          }
        }

        if (!ghost.isStunned) {
          ghost.directionTimer -= delta;
          if (ghost.directionTimer <= 0) {
            ghost.directionTimer = 1.0 + Math.random() * 2.0;
            const toPlayerX = engine.playerX - ghost.mesh.position.x;
            const toPlayerZ = engine.playerZ - ghost.mesh.position.z;
            const len = Math.max(Math.sqrt(toPlayerX * toPlayerX + toPlayerZ * toPlayerZ), 0.1);
            
            ghost.dirX = (toPlayerX / len) * 0.6 + (Math.random() * 2 - 1) * 0.4;
            ghost.dirZ = (toPlayerZ / len) * 0.6 + (Math.random() * 2 - 1) * 0.4;
          }

          if (ghost.knockbackTimer && ghost.knockbackTimer > 0) {
            ghost.knockbackTimer -= delta;
            ghost.mesh.position.x += (ghost.knockbackX || 0) * delta;
            ghost.mesh.position.z += (ghost.knockbackZ || 0) * delta;
            ghost.knockbackX = (ghost.knockbackX || 0) * 0.8;
            ghost.knockbackZ = (ghost.knockbackZ || 0) * 0.8;
          } else {
            ghost.mesh.position.x += ghost.dirX * ghost.speed * delta;
            ghost.mesh.position.z += ghost.dirZ * ghost.speed * delta;
          }

          ghost.ghostTexture.offset.y = 0.0;
        } else {
          ghost.ghostTexture.offset.y = 0.5;
        }

        ghost.animTimer += delta;
        if (ghost.animTimer >= 0.15) {
          ghost.animTimer = 0;
          ghost.currentFrame = (ghost.currentFrame + 1) % 4;
          ghost.ghostTexture.offset.x = ghost.currentFrame * 0.25;
        }

        // ตรวจสอบ Player Collision
        if (!ghost.isStunned && !ghost.isDying) {
          const distToPlayer = ghost.mesh.position.distanceTo(engine.playerMesh.position);
          if (distToPlayer < 1.4 && ghost.attackFlashTimer <= 0) {
            ghost.attackFlashTimer = 1.5;
            audio.playHurt();
            setLives(prev => {
              const nextLives = prev - 1;
              if (nextLives <= 0) {
                setIsDead(true);
                audio.playGameOver();
                // ดึงค่า score ล่าสุดผ่านฟังก์ชันอัปเดตเพื่อหลีกเลี่ยง Stale Closure
                setScore(currentScore => {
                  onGameOver(currentScore);
                  return currentScore;
                });
              }
              return nextLives;
            });
            spawnFloatingText('โอ๊ย! ❤️ -1', engine.playerX, 2.5, engine.playerZ, '#ef4444');
          }
        }
      }

      setGhostsRemaining(remaining);
      if (remaining === 0 && !isGameWon) {
        setIsGameWon(true);
        audio.playWin();
      }

      // --- 5. Update Items Falling & Collectibles (ลูปถอยหลัง) ---
      for (let i = engine.collectibles.length - 1; i >= 0; i--) {
        const item = engine.collectibles[i];
        if (item.mesh.children && item.mesh.children[0]) {
          item.mesh.children[0].rotation.y += 1.5 * delta;
        }
        
        if ((item as any).isLanding) {
          item.mesh.position.y += ((item as any).yVelocity || 0) * delta;
          if (item.mesh.position.y <= 0.8) {
            item.mesh.position.y = 0.8;
            (item as any).isLanding = false;
            spawnFlashParticles(item.mesh.position, new THREE.Color('#fbbf24'), 5);
          }
        }

        const distToItem = item.mesh.position.distanceTo(engine.playerMesh.position);
        if (distToItem < 1.5) {
          audio.playCollect();
          setScore(prev => {
            const nextScore = prev + item.scoreValue;
            spawnFloatingText(`+${item.scoreValue} PTS 🌟`, item.mesh.position.x, 2.0, item.mesh.position.z, '#fbbf24');
            return nextScore;
          });
          setEnergy(prev => Math.min(100, prev + item.energyValue));
          spawnFlashParticles(item.mesh.position, new THREE.Color('#fbbf24'), 12);
          
          engine.scene.remove(item.mesh);
          engine.collectibles.splice(i, 1);
        }
      }

      // --- 6. Update Render Particles (ลูปถอยหลัง) ---
      for (let i = engine.particles.length - 1; i >= 0; i--) {
        const p = engine.particles[i];
        p.life -= delta;
        p.mesh.position.addScaledVector(p.velocity, delta);
        p.velocity.y -= 4.0 * delta; 

        const mat = p.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, p.life / p.maxLife);

        if (p.life <= 0) {
          engine.scene.remove(p.mesh);
          engine.particles.splice(i, 1);
        }
      }

      // --- 7. Update UI HTML Floating Texts Projection (ลูปถอยหลัง) ---
      if (uiOverlayRef.current) {
        for (let i = engine.floatingTexts.length - 1; i >= 0; i--) {
          const t = engine.floatingTexts[i];
          t.life -= delta;
          t.y += 2.0 * delta;

          const wp = new THREE.Vector3(t.x, t.y, t.z);
          wp.project(camera);

          const screenX = (wp.x * .5 + .5) * uiOverlayRef.current.clientWidth;
          const screenY = (-(wp.y * .5) + .5) * uiOverlayRef.current.clientHeight;

          t.element.style.left = `${screenX}px`;
          t.element.style.top = `${screenY}px`;

          if (t.life <= 0) {
            if (uiOverlayRef.current.contains(t.element)) {
              uiOverlayRef.current.removeChild(t.element);
            }
            engine.floatingTexts.splice(i, 1);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeKeys, isPaused, isDead, gameStarted, isGameWon]);

  // ระบบสุ่มไอเทมตกจากฟากฟ้าทุกๆ 7 วินาที
  useEffect(() => {
    if (!gameStarted || isPaused || isDead) return;
    const interval = setInterval(() => {
      spawnRandomItem(false);
    }, 7000);
    return () => clearInterval(interval);
  }, [gameStarted, isPaused, isDead]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px] overflow-hidden select-none bg-slate-950">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div ref={uiOverlayRef} className="absolute inset-0 pointer-events-none overflow-hidden z-20" />

      {/* ================= HUD DISPLAY PANEL ================= */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-30 font-sans">
        <div className="bg-slate-900/80 backdrop-blur-md border border-purple-500/30 p-4 rounded-xl shadow-xl flex flex-col gap-2 pointer-events-auto text-white min-w-[200px]">
          <div className="flex items-center gap-2 border-b border-slate-700 pb-1 mb-1">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="font-bold text-sm tracking-wide text-purple-300">{character.name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">พลังชีวิต:</span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                    i < lives ? 'bg-rose-500 shadow-md shadow-rose-500/50 scale-100' : 'bg-slate-800 scale-90 opacity-40'
                  }`}
                >
                  <span className="text-xs font-bold">{i < lives ? '❤️' : '☠️'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> มานาหมอลำ:
              </span>
              <span className="font-mono font-bold text-orange-400">{energy}/100</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full p-0.5 border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${energy}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/40 p-4 rounded-xl shadow-xl flex items-center gap-4 text-white pointer-events-auto">
            <div className="text-right">
              <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Score</p>
              <p className="text-2xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                {String(score).padStart(6, '0')}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-rose-500/30 flex items-center gap-2 text-xs font-bold text-rose-400">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>ผีตาโขนที่เหลือ: {ghostsRemaining} ตน</span>
          </div>
        </div>
      </div>

      {/* แถบแจ้งเตือนสกิลระเบิดพลัง */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex gap-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-2xl text-white items-center">
        <div className="flex flex-col text-xs">
          <kbd className="px-2 py-1 bg-slate-800 rounded text-center font-mono border border-slate-600 font-bold text-amber-400 text-sm">O</kbd>
          <span className="text-[10px] text-slate-400 text-center mt-1">Skill</span>
        </div>
        <div>
          <p className="text-xs font-bold text-purple-300">ระเบิดพลังวงแหวนหมอลำสะกดวิญญาณ</p>
          <p className="text-[11px] text-slate-400">ใช้มานา 15 หน่วย ฟื้นฟูเลือด 1 แต้มและสั่งให้ผีรอบตัวเต้นรำ 5 วินาที</p>
        </div>
        <div className="relative w-12 h-12 rounded-lg bg-purple-950/40 border border-purple-500/30 overflow-hidden flex items-center justify-center">
          {skillCooldown > 0 ? (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center font-mono font-bold text-purple-400 text-xs">
              <span>{skillCooldown}s</span>
              <div className="w-full h-1 bg-purple-500 absolute bottom-0 left-0 transition-all" style={{ width: `${(skillCooldown/6)*100}%` }} />
            </div>
          ) : energy >= 15 ? (
            <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
          ) : (
            <span className="text-[10px] text-slate-600 font-bold">มานาหมด</span>
          )}
        </div>
      </div>

      {/* ================= MODAL OVERLAYS ================= */}
      {/* 1. Pause Menu */}
      {isPaused && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white p-6">
          <div className="bg-slate-900 p-8 rounded-2xl border border-purple-500/40 max-w-sm w-full text-center shadow-2xl flex flex-col gap-4">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">พักรบชั่วคราว</h2>
            <p className="text-xs text-slate-400">กดปุ่ม Esc อีกครั้งเพื่อกลับเข้าสู่การแข่งขันปราบผีตาโขน</p>
            <button 
              onClick={() => { audio.playSelect(); setIsPaused(false); }}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 active:scale-95 transition-all rounded-xl text-sm font-bold shadow-lg shadow-purple-600/30"
            >
              เล่นเกมต่อ (Resume)
            </button>
            <button 
              onClick={() => { audio.playSelect(); onExit(); }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all border border-slate-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-slate-300"
            >
              <ArrowLeft className="w-4 h-4" /> ออกไปหน้าแรก
            </button>
          </div>
        </div>
      )}

      {/* 2. Victory Display */}
      {isGameWon && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center text-white p-6 animate-fade-in">
          <div className="bg-gradient-to-b from-purple-900/50 to-slate-900 p-8 rounded-2xl border-2 border-amber-400 max-w-md w-full text-center shadow-2xl flex flex-col gap-5 items-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
                ชัยชนะเหนือแดนอีสาน! 🎉
              </h2>
              <p className="text-xs text-slate-300 mt-1">ท่านสามารถกอบกู้วัดโพนชัยและระงับความปั่นป่วนของผีตาโขนได้สำเร็จ</p>
            </div>
            
            <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
              <span className="text-[11px] text-slate-500 block uppercase tracking-wider">Final High Score</span>
              <span className="text-3xl font-black text-amber-400">{score.toLocaleString()} PTS</span>
            </div>

            <div className="flex flex-col gap-2 w-full mt-2">
              <label className="text-left text-xs font-bold text-slate-400 ml-1">บันทึกชื่อผู้กล้าลงกระดาน:</label>
              <input 
                type="text" 
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                maxLength={20}
                className="w-full bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-amber-500 text-center font-bold text-yellow-100" 
              />
            </div>

            <button 
              onClick={() => {
                audio.playSelect();
                onGameOver(score, playerNameInput);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 active:scale-95 transition-all rounded-xl text-sm font-black text-slate-950 shadow-xl shadow-amber-500/20"
            >
              ส่งพิกัดคะแนนและปิดฉาก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

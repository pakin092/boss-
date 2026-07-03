// (คงเดิมไว้... ตั้งแต่ import จนถึงส่วน LOGIC)
// แก้ไขส่วน render ใน screen === 'game_over' ให้สมบูรณ์ ดังนี้:

      {/* GAME OVER / ACHIEVEMENT SCORE SCREEN */}
      {screen === 'game_over' && (
        <div className="w-full h-full flex flex-col justify-center items-center p-8 relative z-10">
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <span className="text-6xl block mb-3">👻</span>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">
              RITUAL ENDED
            </h2>
            <p className="text-zinc-400 mt-2 font-mono">YOUR FINAL SCORE: {lastScore}</p>
            
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => { audio.playSelect(); setScreen('lobby'); }}
                className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest transition-all"
              >
                RETURN TO LOBBY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* การ Render เกมจริงเมื่อเข้าหน้า play */}
      {screen === 'play' && (
        <GameCanvas 
          characterId={selectedCharId} 
          onGameOver={handleGameOver}
        />
      )}
    </div>
  );
}

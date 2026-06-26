import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import { audio } from './components/AudioEngine';
import { Character, CharacterId, GameSettings, HighScore } from './types';
import { 
  Gamepad2, 
  Settings, 
  Trophy, 
  Play, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Info, 
  X, 
  Flame, 
  RotateCcw, 
  BookOpen,
  Keyboard,
  Compass,
  ArrowRight
} from 'lucide-react';

const CHARACTERS: Character[] = [
  {
    id: 'red',
    name: 'Phi Ta Khon Daeng',
    thaiName: 'ผีตาโขนแดง (พญายักษ์)',
    color: '#dc2626',
    accentColor: '#f43f5e',
    description: 'ผีตาโขนสีแดงเพลิงผู้ทรงพลัง มีความเร็วในการเดินสูงและหน้ากากที่ดุดัน สัญลักษณ์แห่งความศักดิ์สิทธิ์และพลังอำนาจในการปกป้องงานบุญหลวง',
    thaiDescription: 'เน้นความเร็วสูงสุดในการสำรวจและการบุกปะทะ มีออร่าสีแดงแรงฤทธิ์กระจายรอบตัวเมื่อเต้นรำ',
    speed: 6.5,
    jumpForce: 12,
    maxJumps: 2,
    specialAbility: 'Speed Blitz',
    thaiSpecialAbility: 'เคลื่อนที่รวดเร็วสูงดั่งสายฟ้า'
  },
  {
    id: 'green',
    name: 'Phi Ta Khon Khiaw',
    thaiName: 'ผีตาโขนเขียว (ไพรพฤกษา)',
    color: '#059669',
    accentColor: '#34d399',
    description: 'ผีตาโขนสีเขียวใบตองผู้รักษ์ธรรมชาติ มีความพริ้วไหว อ่อนโยนแต่แฝงด้วยความเฉียวฉลาด คอยปกป้องผืนดินด่านซ้ายให้ชุ่มชื้นร่มเย็น',
    thaiDescription: 'เพิ่มอัตราฟื้นฟูพลังชีวิต และสามารถปล่อยคลื่นธรรมชาติบำบัดจิตวิญญาณรอบตัวได้กว้างขวาง',
    speed: 5.2,
    jumpForce: 14,
    maxJumps: 2,
    specialAbility: 'Nature Heal',
    thaiSpecialAbility: 'ฟื้นฟูสุขภาพพลังรวดเร็วและต่อเนื่อง'
  },
  {
    id: 'gold',
    name: 'Phi Ta Khon Thong',
    thaiName: 'ผีตาโขนทอง (สิริมงคล)',
    color: '#d97706',
    accentColor: '#fbbf24',
    description: 'ผีตาโขนสีทองอร่าม สัญลักษณ์แห่งโชคลาภและความรุ่งเรือง ได้รับพรชัยมงคลจากองค์พระอุปคุตเพื่อขับไล่สิ่งชั่วร้ายและกักเก็บพลังงานศักดิ์สิทธิ์',
    thaiDescription: 'มีความสามารถสะสมพลังงานได้สูงสุด และได้รับโบนัสคะแนนเพิ่มขึ้น 20% ทุกการเก็บไอเทม',
    speed: 4.8,
    jumpForce: 11,
    maxJumps: 2,
    specialAbility: 'Score Magnet & Wealth',
    thaiSpecialAbility: 'ดึงดูดพลังงานและรับคะแนนพิเศษมากกว่าปกติ'
  }
];

const DEFAULT_SETTINGS: GameSettings = {
  volume: 60,
  soundEnabled: true,
  musicEnabled: true,
  showOnScreenButtons: true,
  controls: {
    left: 'A',
    right: 'D',
    jump: 'W',
    action: 'P'
  }
};

export default function App() {
  const [screen, setScreen] = useState<'lobby' | 'char_select' | 'options' | 'how_to_play' | 'play' | 'game_over'>('lobby');
  const [selectedCharId, setSelectedCharId] = useState<CharacterId>('red');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [activeKeyBinding, setActiveKeyBinding] = useState<keyof GameSettings['controls'] | null>(null);

  // Load Saved Settings & High Scores
  useEffect(() => {
    const savedSettings = localStorage.getItem('dansai_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error parsing settings', e);
      }
    }

    const savedScores = localStorage.getItem('dansai_scores');
    if (savedScores) {
      try {
        setHighScores(JSON.parse(savedScores));
      } catch (e) {
        console.error('Error parsing scores', e);
      }
    } else {
      // Mock initial high scores for visual feedback
      const initialScores: HighScore[] = [
        { name: 'ไอ้ทิดแดง', score: 2850, characterId: 'red', date: '2026-06-25' },
        { name: 'ส้มตำด่านซ้าย', score: 1900, characterId: 'gold', date: '2026-06-25' },
        { name: 'ผีตาโขนจิ๋ว', score: 1200, characterId: 'green', date: '2026-06-25' }
      ];
      setHighScores(initialScores);
      localStorage.setItem('dansai_scores', JSON.stringify(initialScores));
    }
  }, []);

  // Update sound engine configurations when settings change
  useEffect(() => {
    audio.setSettings(settings.soundEnabled, settings.musicEnabled, settings.volume);
  }, [settings]);

  const saveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem('dansai_settings', JSON.stringify(newSettings));
  };

  const handleStartGame = () => {
    audio.playSelect();
    setScreen('char_select');
  };

  const handleLaunchGame = (charId: CharacterId) => {
    setSelectedCharId(charId);
    audio.playSelect();
    setScreen('play');
  };

  const handleGameOver = (finalScore: number) => {
    setLastScore(finalScore);
    
    // Save new high score prompt
    const playerName = prompt('ยินดีด้วย! คุณรักษางานบุญหลวงสำเร็จ กรุณากรอกชื่อของคุณ (Enter Your Name):', 'ผู้กล้าแดนซ้าย') || 'นิรนาม';
    
    const newScore: HighScore = {
      name: playerName,
      score: finalScore,
      characterId: selectedCharId,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Keep top 5

    setHighScores(updatedScores);
    localStorage.setItem('dansai_scores', JSON.stringify(updatedScores));
    
    setScreen('game_over');
  };

  const handleKeybindChange = (control: keyof GameSettings['controls']) => {
    audio.playSelect();
    setActiveKeyBinding(control);
  };

  // Keyboard binding listener
  useEffect(() => {
    if (!activeKeyBinding) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const keyName = e.key.toUpperCase();
      
      const newControls = { ...settings.controls, [activeKeyBinding]: keyName };
      saveSettings({ ...settings, controls: newControls });
      setActiveKeyBinding(null);
      audio.playSelect();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeKeyBinding, settings]);

  const activeChar = CHARACTERS.find(c => c.id === selectedCharId) || CHARACTERS[0];

  return (
    <div className="w-full h-screen bg-black text-white font-sans overflow-hidden relative selection:bg-red-500 selection:text-white">
      {/* Background Animated Atmosphere */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #e63946 0%, transparent 70%)' }}></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,30,30,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,30,30,0.3)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* LOBBY SCREEN */}
      {screen === 'lobby' && (
        <div className="w-full h-full flex flex-col justify-between p-8 md:p-12 relative z-10 overflow-y-auto">
          {/* Top navigation branding */}
          <nav className="flex justify-between items-center w-full max-w-7xl mx-auto border-b border-zinc-900 pb-4">
            <div className="text-[10px] tracking-[0.3em] uppercase opacity-60 font-bold">BUILT FOR COMPETITIVE PLAY • V1.2.0</div>
            <div className="text-[10px] tracking-[0.3em] uppercase opacity-60 font-bold">SERVER STATUS: ACTIVE</div>
          </nav>

          {/* Main Hero Container */}
          <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-12 py-8">
            {/* Left Column: Bold Typography Headers & Nav links */}
            <div className="w-full md:w-1/2 flex flex-col items-start gap-8">
              <img 
                src="https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440016/logo_ibrufq.png" 
                alt="Dan Sai Adventure Logo" 
                className="w-44 h-auto drop-shadow-[0_0_15px_rgba(230,57,70,0.5)] transition-transform duration-500 hover:scale-105"
              />
              
              <div>
                <h1 className="text-6xl md:text-8xl font-black uppercase leading-none tracking-tighter italic border-l-8 border-red-600 pl-6 text-left">
                  Dan Sai<br/>Adventure
                </h1>
                <p className="mt-4 text-zinc-400 text-sm md:text-base max-w-md font-sans">
                  ประเพณีผีตาโขนผจญภัย ค้นพบจิตวิญญาณแห่งเมืองด่านซ้ายผ่านหน้ากากศิลปะท้องถิ่นและการต่อสู้สุดมันส์ในสนามจำลองสามมิติ
                </p>
              </div>

              {/* Bold interactive text menu layout */}
              <div className="flex flex-col items-start gap-4 mt-4 w-full">
                <button 
                  onClick={handleStartGame}
                  className="group flex items-center gap-4 text-2xl md:text-3xl font-black uppercase tracking-widest text-white hover:text-red-500 transition-colors cursor-pointer text-left"
                >
                  <span className="h-[3px] w-8 bg-red-600 group-hover:w-16 transition-all duration-300"></span>
                  START ADVENTURE
                </button>
                
                <button 
                  onClick={() => { audio.playSelect(); setScreen('options'); }}
                  className="group flex items-center gap-4 text-2xl md:text-3xl font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <span className="h-[2px] w-8 bg-zinc-850 group-hover:bg-red-500 transition-all duration-300"></span>
                  GAME OPTIONS
                </button>

                <button 
                  onClick={() => { audio.playSelect(); setScreen('how_to_play'); }}
                  className="group flex items-center gap-4 text-2xl md:text-3xl font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <span className="h-[2px] w-8 bg-zinc-850 group-hover:bg-red-500 transition-all duration-300"></span>
                  HOW TO PLAY
                </button>
              </div>
            </div>

            {/* Right Column: Leaderboard / Status Module */}
            <div className="w-full md:w-96 bg-zinc-950/80 backdrop-blur-md border border-zinc-900 p-6 md:p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                <h2 className="text-sm font-black uppercase tracking-widest">LEADERBOARD TOP SCORES</h2>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {highScores.slice(0, 4).map((scoreObj, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-900/40 p-2.5 rounded border border-zinc-900/60 hover:border-red-600/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 font-bold">{idx + 1}.</span>
                      <span className="font-sans font-extrabold text-zinc-200">{scoreObj.name}</span>
                      <span className="text-[9px] bg-red-950/50 border border-red-900 px-1.5 py-0.5 rounded text-red-400 uppercase font-bold">{scoreObj.characterId}</span>
                    </div>
                    <span className="text-red-500 font-black">★ {scoreObj.score}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                <span>PROJECT SERIES • 01</span>
                <span>PIXEL SIAM DIGITAL</span>
              </div>
            </div>
          </div>

          {/* Footer bar */}
          <footer className="w-full max-w-7xl mx-auto border-t border-zinc-950 pt-6 flex flex-col md:flex-row justify-between gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
            <div className="flex gap-8">
              <span>Copyright © 2026 PIXELSIAM</span>
              <span>Dan Sai Municipality, Loei</span>
            </div>
            <div>THAI TRADITIONAL FESTIVAL SPECIAL EDITION</div>
          </footer>
        </div>
      )}

      {/* CHARACTER SELECT SCREEN */}
      {screen === 'char_select' && (
        <div className="w-full h-full flex flex-col justify-between p-8 md:p-12 relative z-10 overflow-y-auto">
          <div>
            <button 
              onClick={() => { audio.playSelect(); setScreen('lobby'); }}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white mb-6 border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 rounded-lg cursor-pointer transition-colors uppercase font-mono font-bold tracking-wider"
            >
              <X className="w-3.5 h-3.5" /> Back To Lobby
            </button>
            
            <div className="border-l-8 border-red-600 pl-6 max-w-4xl mx-auto text-left">
              <h2 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tighter italic">
                Select Spirit Mask
              </h2>
              <p className="text-xs text-zinc-500 font-mono tracking-widest mt-2 uppercase">
                Choose your avatar representing traditional Phi Ta Khon styles
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 max-w-5xl mx-auto w-full">
            {CHARACTERS.map((char) => (
              <div 
                key={char.id}
                onClick={() => setSelectedCharId(char.id)}
                className={`p-6 rounded-2xl border transition-all duration-300 relative cursor-pointer flex flex-col justify-between overflow-hidden group ${
                  selectedCharId === char.id 
                  ? 'bg-zinc-900/90 border-red-600 ring-4 ring-red-600/20 transform scale-[1.01]' 
                  : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/30'
                }`}
              >
                <div 
                  className="absolute -top-12 -right-12 w-24 h-24 rounded-full filter blur-2xl opacity-15"
                  style={{ backgroundColor: char.color }}
                />

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase font-mono font-black tracking-widest px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                      SPIRIT
                    </span>
                    <span className="text-xl">🎭</span>
                  </div>

                  <h3 className="text-2xl font-black uppercase italic tracking-tight mb-1" style={{ color: char.color }}>
                    {char.name}
                  </h3>
                  <div className="text-xs text-zinc-400 font-semibold mb-4 font-sans">{char.thaiName}</div>
                  
                  {/* Stats Block */}
                  <div className="space-y-3 mb-4 font-mono text-xs text-zinc-300 bg-zinc-950/80 p-4 rounded-xl border border-zinc-900">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">SPEED (ความเร็ว):</span>
                      <span className="text-white font-black">{char.speed}</span>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded overflow-hidden">
                      <div className="h-full transition-all" style={{ width: `${char.speed * 10}%`, backgroundColor: char.color }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">JUMP (ความพริ้ว):</span>
                      <span className="text-white font-black">{char.jumpForce}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-sans border-t border-zinc-900 pt-4">
                    {char.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-zinc-900 pt-4">
                  <div className="text-[10px] text-zinc-500 uppercase font-mono font-black tracking-wider mb-1">SPECIAL SKILL:</div>
                  <div className="text-xs font-extrabold text-red-500 flex items-center gap-1.5 uppercase">
                    <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
                    {char.thaiSpecialAbility}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Confirm Button */}
          <div className="max-w-xs mx-auto w-full mb-6">
            <button 
              onClick={() => handleLaunchGame(selectedCharId)}
              className="w-full py-4 bg-white hover:bg-zinc-100 text-black font-black uppercase text-sm tracking-widest transition-all shadow-xl cursor-pointer hover:scale-[1.02] active:scale-100"
            >
              CONFIRM SELECTION
            </button>
          </div>
        </div>
      )}

      {/* OPTIONS SCREEN */}
      {screen === 'options' && (
        <div className="w-full h-full flex flex-col justify-between p-8 md:p-12 relative z-10 overflow-y-auto">
          <div>
            <button 
              onClick={() => { audio.playSelect(); setScreen('lobby'); }}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white mb-6 border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 rounded-lg cursor-pointer transition-colors uppercase font-mono font-bold tracking-wider"
            >
              <X className="w-3.5 h-3.5" /> Cancel / Back
            </button>
            
            <div className="border-l-8 border-red-600 pl-6 max-w-xl mx-auto text-left">
              <h2 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tighter italic">
                Game Options
              </h2>
              <p className="text-xs text-zinc-500 font-mono tracking-widest mt-2 uppercase">
                Configure audio parameters and custom hardware keys
              </p>
            </div>
          </div>

          <div className="max-w-xl mx-auto w-full my-6 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            
            {/* Audio Settings Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-red-500 font-mono flex items-center gap-1.5 uppercase border-b border-zinc-900 pb-2 tracking-widest">
                <Volume2 className="w-4 h-4" /> AUDIO PREFERENCES
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sound Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 rounded border border-zinc-800/80">
                  <span className="text-xs font-bold text-zinc-300">SOUND EFFECTS</span>
                  <input 
                    type="checkbox" 
                    checked={settings.soundEnabled}
                    onChange={(e) => {
                      audio.playSelect();
                      saveSettings({ ...settings, soundEnabled: e.target.checked });
                    }}
                    className="w-4 h-4 accent-red-600 cursor-pointer"
                  />
                </div>

                {/* Music Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 rounded border border-zinc-800/80">
                  <span className="text-xs font-bold text-zinc-300">ISAN SOUNDTRACK</span>
                  <input 
                    type="checkbox" 
                    checked={settings.musicEnabled}
                    onChange={(e) => {
                      audio.playSelect();
                      saveSettings({ ...settings, musicEnabled: e.target.checked });
                    }}
                    className="w-4 h-4 accent-red-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Volume Slider */}
              <div className="space-y-2 bg-zinc-900/40 p-4 rounded border border-zinc-800/80">
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono font-bold tracking-wider">
                  <span>MASTER VOLUME LEVEL</span>
                  <span>{settings.volume}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={settings.volume}
                  onChange={(e) => {
                    const vol = parseInt(e.target.value);
                    saveSettings({ ...settings, volume: vol });
                  }}
                  className="w-full accent-red-600 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Custom Control Configuration */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-red-500 font-mono flex items-center gap-1.5 uppercase border-b border-zinc-900 pb-2 tracking-widest">
                <Keyboard className="w-4 h-4" /> KEY BINDINGS CONFIG
              </h3>

              {activeKeyBinding && (
                <div className="p-3 bg-red-950/40 text-red-300 text-xs font-mono font-bold rounded border border-red-900/50 text-center animate-pulse">
                  PRESS KEY TO BIND TO {activeKeyBinding.toUpperCase()}...
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 font-mono">
                {/* Left Key */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded border border-zinc-800/80 text-xs">
                  <span className="text-zinc-500 font-bold">LEFT:</span>
                  <button 
                    onClick={() => handleKeybindChange('left')}
                    className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-red-500 font-black rounded border border-zinc-700 transition-colors uppercase"
                  >
                    {settings.controls.left}
                  </button>
                </div>

                {/* Right Key */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded border border-zinc-800/80 text-xs">
                  <span className="text-zinc-500 font-bold">RIGHT:</span>
                  <button 
                    onClick={() => handleKeybindChange('right')}
                    className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-red-500 font-black rounded border border-zinc-700 transition-colors uppercase"
                  >
                    {settings.controls.right}
                  </button>
                </div>

                {/* Jump Key */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded border border-zinc-800/80 text-xs">
                  <span className="text-zinc-500 font-bold">JUMP/UP:</span>
                  <button 
                    onClick={() => handleKeybindChange('jump')}
                    className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-red-500 font-black rounded border border-zinc-700 transition-colors uppercase"
                  >
                    {settings.controls.jump}
                  </button>
                </div>

                {/* Attack Key */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded border border-zinc-800/80 text-xs">
                  <span className="text-zinc-500 font-bold">PUNCH:</span>
                  <button 
                    onClick={() => handleKeybindChange('action')}
                    className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-red-500 font-black rounded border border-zinc-700 transition-colors uppercase"
                  >
                    {settings.controls.action}
                  </button>
                </div>
              </div>

              {/* Preset reset button */}
              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => {
                    audio.playSelect();
                    saveSettings({ ...settings, controls: DEFAULT_SETTINGS.controls });
                  }}
                  className="flex items-center gap-1 text-[11px] font-mono font-black tracking-widest px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> RESET LAYOUT
                </button>
              </div>
            </div>

            {/* Mobile Touch Controller Option */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 rounded border border-zinc-800/80">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-300 block">ON-SCREEN BUTTONS (TOUCH)</span>
                <span className="text-[10px] text-zinc-500 font-sans block">Displays virtual joysticks for mobile navigation</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.showOnScreenButtons}
                onChange={(e) => {
                  audio.playSelect();
                  saveSettings({ ...settings, showOnScreenButtons: e.target.checked });
                }}
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
            </div>

          </div>

          <div className="max-w-xs mx-auto w-full mb-4">
            <button 
              onClick={() => { audio.playSelect(); setScreen('lobby'); }}
              className="w-full py-3 bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs tracking-widest transition-all shadow-xl cursor-pointer"
            >
              SAVE PREFERENCES
            </button>
          </div>
        </div>
      )}

      {/* HOW TO PLAY INFO SCREEN */}
      {screen === 'how_to_play' && (
        <div className="w-full h-full flex flex-col justify-between p-8 md:p-12 relative z-10 overflow-y-auto">
          <div>
            <button 
              onClick={() => { audio.playSelect(); setScreen('lobby'); }}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white mb-6 border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 rounded-lg cursor-pointer transition-colors uppercase font-mono font-bold tracking-wider"
            >
              <X className="w-3.5 h-3.5" /> Back To Lobby
            </button>
            
            <div className="border-l-8 border-red-600 pl-6 max-w-3xl mx-auto text-left">
              <h2 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tighter italic">
                How To Play
              </h2>
              <p className="text-xs text-zinc-500 font-mono tracking-widest mt-2 uppercase">
                Explore the sacred myths and game instructions
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto w-full my-6 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
            
            {/* The Tradition story */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-red-500 font-mono flex items-center gap-1.5 uppercase border-b border-zinc-900 pb-2 tracking-widest">
                <Compass className="w-4 h-4 text-red-500 animate-spin" /> THE LEGEND OF PHI TA KHON
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                ประเพณีผีตาโขนจัดขึ้นในอำเภอด่านซ้าย จังหวัดเลย เป็นการเฉลิมฉลองการละเล่นที่ชาวบ้านแต่งกายด้วยชุดหลากสี และสวมหน้ากากผีตาโขนอันประณีตซึ่งทำขึ้นมาจากโคนกอไผ่และหวดนึ่งข้าวเหนียว เพื่อบูชาผืนแผ่นดิน ความเจริญรุ่งเรืองด้านผลผลิต และต้อนรับสิ่งศักดิ์สิทธิ์เข้าสู่ชุมชนเมืองด่านซ้ายอันร่มเย็น
              </p>
            </div>

            {/* Gameplay Rules */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-red-500 font-mono flex items-center gap-1.5 uppercase border-b border-zinc-900 pb-2 tracking-widest">
                🏆 ADVENTURE RULES & GOALS
              </h3>
              <ul className="space-y-2 text-xs text-zinc-300 list-disc list-inside font-sans">
                <li><span className="text-red-500 font-black">WAT SITE GROUND</span>: เดินสำรวจด้วยความแม่นยำ 8 ทิศทาง รอบลานวัดที่สวยงามที่มีการวางผังสิ่งมงคลทางวัฒนธรรม</li>
                <li><span className="text-red-500 font-black">DEFEAT ROGUE SPIRITS</span>: ใช้ปุ่ม <span className="text-white font-black bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">P</span> เพื่อต่อยโจมตีวิญญาณป่วนเมืองให้กลับไปเต้นรำด้วยกัน</li>
                <li><span className="text-red-500 font-black">ISAN RITUAL DANCE</span>: เมื่อเกจพลังวิญญาณเต็ม กดปุ่ม <span className="text-white font-black bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">O</span> เพื่อเต้นรำร่ายร่ายเวทย์ออร่าฟื้นพลังและลดสมาธิศัตรูรอบลานวัดอย่างยิ่งใหญ่</li>
                <li><span className="text-red-500 font-black">SACRED COLLECTIBLES</span>: เก็บหน้ากากดั้งเดิม (Masks) กระติบข้าวเหนียว (Kratip) และกระดิ่งทอง เพื่อความรุ่งเรืองและคะแนนพิเศษสูงสุด</li>
              </ul>
            </div>

            {/* Controls Illustration Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-900 pt-4">
              <div className="p-4 bg-zinc-900/40 rounded border border-zinc-850 text-xs">
                <span className="font-black text-red-500 uppercase block mb-1 font-mono tracking-wider">🎮 KEYBOARD CONTROLS</span>
                <p className="mt-1">• Move Character: <span className="font-mono text-white bg-zinc-900 px-1.5 py-0.5 rounded font-black border border-zinc-800">W, A, S, D</span> / <span className="font-mono text-white bg-zinc-900 px-1.5 py-0.5 rounded font-black border border-zinc-800">Arrows</span></p>
                <p className="mt-1">• Attack / Punch: <span className="font-mono text-white bg-zinc-900 px-1.5 py-0.5 rounded font-black border border-zinc-800">P</span></p>
                <p className="mt-1">• Ritual Dance Aura: <span className="font-mono text-white bg-zinc-900 px-1.5 py-0.5 rounded font-black border border-zinc-800">O</span></p>
              </div>
              <div className="p-4 bg-zinc-900/40 rounded border border-zinc-850 text-xs">
                <span className="font-black text-red-500 uppercase block mb-1 font-mono tracking-wider">📱 MOBILE TOUCH</span>
                <p className="mt-1">• Use the 8-way virtual touchpad on the left screen side to steer gracefully.</p>
                <p className="mt-1">• Tap highlighted action nodes <span className="font-bold text-red-500">P</span> and <span className="font-bold text-red-400">O</span> on the right to unleash mechanics.</p>
              </div>
            </div>

          </div>

          <div className="max-w-xs mx-auto w-full mb-4">
            <button 
              onClick={() => { audio.playSelect(); setScreen('lobby'); }}
              className="w-full py-3 bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs tracking-widest transition-all shadow-xl cursor-pointer"
            >
              PROCEED TO LANDS
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER / ACHIEVEMENT SCORE SCREEN */}
      {screen === 'game_over' && (
        <div className="w-full h-full flex flex-col justify-between p-8 md:p-12 relative z-10 overflow-y-auto">
          <div className="text-center mt-6">
            <span className="text-6xl animate-pulse block mb-3">👻</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tighter italic border-b-4 border-red-600 pb-2 inline-block">
              RUN COMPLETED
            </h2>
            <p className="text-xs text-zinc-500 font-mono mt-2 uppercase tracking-widest">
              Your spiritual adventure in Dan Sai has finalized
            </p>
          </div>

          <div className="max-w-md mx-auto w-full my-6 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 md:p-8 space-y-6 text-center shadow-2xl">
            
            <div className="space-y-1">
              <span className="text-zinc-500 text-xs font-mono uppercase font-black tracking-widest block">SELECTED COMPANION</span>
              <div className="text-xl font-black uppercase italic" style={{ color: activeChar.color }}>
                {activeChar.name}
              </div>
            </div>

            <div className="p-5 bg-zinc-900/40 rounded border border-zinc-850">
              <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest block mb-1 font-bold">TOTAL SAVED merit score</span>
              <div className="text-5xl font-black text-red-500">
                ★ {lastScore || 0}
              </div>
            </div>

            {/* Score List */}
            <div className="space-y-3 font-mono text-xs">
              <h4 className="text-red-500 font-black border-b border-zinc-900 pb-1.5 uppercase tracking-widest">
                🏆 RECORD HIGH SCOREBOARD
              </h4>
              <div className="space-y-1.5 text-slate-300 max-h-32 overflow-y-auto">
                {highScores.map((scoreObj, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-900/20 px-3 py-2 rounded border border-zinc-900 hover:border-red-600/20 transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 font-black">{idx + 1}.</span>
                      <span className="font-sans font-extrabold text-zinc-200">{scoreObj.name}</span>
                      <span className="text-[9px] bg-red-950/50 border border-red-900 px-1.5 py-0.5 rounded text-red-400 uppercase font-bold">{scoreObj.characterId}</span>
                    </div>
                    <span className="text-red-500 font-black">★ {scoreObj.score}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="max-w-xs mx-auto w-full mb-6 flex flex-col gap-3">
            <button 
              onClick={() => { audio.playSelect(); setScreen('char_select'); }}
              className="w-full py-4 bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs tracking-widest transition-all shadow-xl cursor-pointer hover:scale-[1.01]"
            >
              REPLAY ADVENTURE
            </button>
            <button 
              onClick={() => { audio.playSelect(); setScreen('lobby'); }}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 font-bold uppercase text-xs tracking-widest text-zinc-400 hover:text-white rounded transition-all cursor-pointer"
            >
              RETURN TO LOBBY
            </button>
          </div>
        </div>
      )}

      {/* GAME RUNTIME SCREEN */}
      {screen === 'play' && (
        <div className="w-full h-full relative z-10">
          <GameCanvas 
            character={activeChar}
            settings={settings}
            onExit={() => {
              audio.playSelect();
              setScreen('lobby');
            }}
            onGameOver={handleGameOver}
          />
        </div>
      )}

    </div>
  );
}

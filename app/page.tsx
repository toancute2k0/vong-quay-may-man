'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Wheel from '@/components/Wheel/Wheel';
import Controls from '@/components/Controls/Controls';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Home as HomeIcon, List, Dices, Gift } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  color: string;
  textColor: string;
}

interface HistoryItem extends Option {
  timestamp: string;
}

export default function Home() {
  const [options, setOptions] = useState<Option[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<Option | null>(null);
  const [mobileTab, setMobileTab] = useState<'game' | 'options'>('game');

  // Fetch initial data
  useEffect(() => {
    fetch('/api/wheel-data')
      .then((res) => res.json())
      .then((data) => {
        if (data.options) setOptions(data.options);
        if (data.history) setHistory(data.history);
      })
      .catch((err) => console.error('Failed to load data:', err));
  }, []);

  const handleAddOption = async (label: string) => {
    const lastColor = options.length > 0 ? options[options.length - 1].color : '';
    let color = '#D70018'; 
    let textColor = '#FFD700'; 
    
    if (lastColor === '#D70018') {
        color = '#FFFFFF';
        textColor = '#D70018';
    } else if (lastColor === '#FFFFFF') {
        color = '#FFD700';
        textColor = '#D70018';
    } else {
        color = '#D70018';
        textColor = '#FFD700';
    }

    const newOption = {
      id: Date.now().toString(),
      label,
      color,
      textColor
    };

    const newOptions = [...options, newOption];
    setOptions(newOptions);

    await fetch('/api/wheel-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ADD_OPTION', payload: newOption })
    });
  };

  const handleDeleteOption = async (id: string) => {
    const newOptions = options.filter(o => o.id !== id);
    setOptions(newOptions);
    await fetch('/api/wheel-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE_OPTION', payload: { id } })
    });
  };

  const handleClearHistory = async () => {
    setHistory([]);
    await fetch('/api/wheel-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESET_HISTORY', payload: {} })
    });
  };

  const handleSpin = () => {
    if (isSpinning || options.length === 0) return;

    setShowResult(null);

    // Logic: Avoid last 3 results
    const last3Ids = history.slice(0, 3).map(h => h.id);
    const validOptions = options.filter(o => !last3Ids.includes(o.id));
    
    const pool = validOptions.length > 0 ? validOptions : options;
    
    const randomWinner = pool[Math.floor(Math.random() * pool.length)];
    const winnerIdx = options.findIndex(o => o.id === randomWinner.id);

    setWinnerIndex(winnerIdx);
    setIsSpinning(true);
  };

  const onSpinEnd = async (winner: Option) => {
    // Fireworks handled by effect depending on showResult
    const historyItem = { ...winner, timestamp: new Date().toISOString() };
    const newHistory = [historyItem, ...history].slice(0, 50);
    setHistory(newHistory);
    setShowResult(winner);

    await fetch('/api/wheel-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ADD_HISTORY', payload: winner })
    });
  };

  // Persistent Fireworks Effect
  useEffect(() => {
    if (!showResult) return;

    const duration = 250;
    const end = Date.now() + duration;
    let animationFrameId: number;

    const frame = () => {
      // Launch a few confetti
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#D70018', '#FFD700', '#FFFFFF']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#D70018', '#FFD700', '#FFFFFF']
      });

      // Keep loop going if showResult is still true
      // We don't check time anymore, we check state existence via cleanup or loop
      // Actually, since this is in useEffect [showResult], we can just set an interval or recursive loop
      // that is cleared on cleanup.
      
      animationFrameId = requestAnimationFrame(frame);
    };

    frame();

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
  }, [showResult]);
  
  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-hidden">
        {/* Background Effects */}
        <div className="bg-sunburst"></div>
        <div className="bg-overlay"></div>

        {/* Header */}
        <header className="z-10 pt-8 pb-4 text-center animate-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#B8860B] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] uppercase tracking-tight" style={{WebkitTextStroke: '1px #FFF'}}>
                Vòng Quay
            </h1>
            <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_4px_0_#D70018] uppercase tracking-wider mt-2 transform -rotate-2">
                Ăn Trưa
            </h2>
        </header>

        {/* Desktop View (Side by Side) */}
        <div className="relative z-10 hidden md:flex items-center justify-center gap-12 p-6 flex-wrap w-full max-w-6xl mt-4">
            <WheelSection 
                options={options} 
                isSpinning={isSpinning} 
                setIsSpinning={setIsSpinning} 
                onSpinEnd={onSpinEnd} 
                winnerIndex={winnerIndex} 
                handleSpin={handleSpin}
            />
            <Controls 
                options={options} 
                history={history}
                onAddOption={handleAddOption}
                onDeleteOption={handleDeleteOption}
                onClearHistory={handleClearHistory}
            />
        </div>

        {/* Mobile View (Tabs) */}
        <div className="relative z-10 md:hidden w-full flex-1 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4">
                {mobileTab === 'game' ? (
                    <WheelSection 
                        options={options} 
                        isSpinning={isSpinning} 
                        setIsSpinning={setIsSpinning} 
                        onSpinEnd={onSpinEnd} 
                        winnerIndex={winnerIndex} 
                        handleSpin={handleSpin}
                    />
                ) : (
                    <Controls 
                        options={options} 
                        history={history}
                        onAddOption={handleAddOption}
                        onDeleteOption={handleDeleteOption}
                        onClearHistory={handleClearHistory}
                    />
                )}
            </div>
            
            {/* Mobile Bottom Nav */}
            <div className="bg-black/80 backdrop-blur-md border-t border-gold/30 p-2 safe-bottom">
                <div className="flex justify-around items-center max-w-sm mx-auto">
                    <button 
                        onClick={() => setMobileTab('game')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${mobileTab === 'game' ? 'text-[#FFD700] scale-110 drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]' : 'text-gray-400'}`}
                    >
                        <Dices size={24} strokeWidth={mobileTab === 'game' ? 3 : 2} />
                        <span className="text-xs font-bold uppercase">Vòng Quay</span>
                    </button>
                    <button 
                        onClick={() => setMobileTab('options')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${mobileTab === 'options' ? 'text-[#FFD700] scale-110 drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]' : 'text-gray-400'}`}
                    >
                        <List size={24} strokeWidth={mobileTab === 'options' ? 3 : 2} />
                        <span className="text-xs font-bold uppercase">Menu & KQ</span>
                    </button>
                </div>
            </div>
        </div>

        {/* Result Overlay */}
        {showResult && (
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in zoom-in duration-300 p-4"
                onClick={() => setShowResult(null)}
            >
                <div 
                    className="relative bg-gradient-to-b from-[#D70018] to-[#8B0000] p-8 rounded-[2rem] text-center border-4 border-[#FFD700] shadow-[0_0_50px_rgba(255,215,0,0.6)] w-full max-w-sm mx-auto transform transition-all"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Ribbon */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#FFD700] text-[#D70018] font-black py-2 px-8 rounded-full shadow-lg border-2 border-white whitespace-nowrap text-lg">
                        TRÚNG 100%
                    </div>

                    <div className="mt-6 mb-2 text-[#FFD700] font-bold uppercase tracking-widest text-sm">Chúc mừng bạn</div>
                    
                    <div className="bg-white/10 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] border-2 border-[#FFD700]/30 animate-bounce">
                        <Gift size={64} className="text-[#FFD700] drop-shadow-md" />
                    </div>

                    <div className="text-4xl font-black text-white drop-shadow-[0_2px_0_#000] mb-8 leading-tight">
                        {showResult.label}
                    </div>

                    <button 
                        onClick={() => setShowResult(null)} 
                        className="w-full py-4 bg-gradient-to-b from-[#FFD700] to-[#FFAA00] text-[#8B0000] rounded-xl text-xl font-black uppercase shadow-[0_4px_0_#B8860B] active:translate-y-1 active:shadow-none transition-all hover:brightness-110"
                    >
                        NHẬN QUÀ NGAY
                    </button>
                    
                    <button 
                        onClick={() => setShowResult(null)}
                        className="absolute -top-4 -right-4 bg-[#FF0000] text-white rounded-full w-10 h-10 flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform font-bold"
                    >
                        ✕
                    </button>
                </div>
            </div>
        )}
    </main>
  );
}

// Helper component for Wheel Section to avoid code sync issues between mobile/desktop
function WheelSection({ options, isSpinning, setIsSpinning, onSpinEnd, winnerIndex, handleSpin }: any) {
    return (
        <div className="relative group scale-90 md:scale-100 transition-transform">
            {/* Lights Ring */}
            <div className="absolute inset-[-20px] rounded-full border-[10px] border-[#B8860B] bg-[#8B0000] shadow-[0_0_20px_#000]">
                 {/* CSS Dots are handled in global or wheel css, but simple border works for now. Better to use SVG or dashed border */}
                 <div className="w-full h-full rounded-full border-4 border-dashed border-[#FFD700] opacity-50 animate-spin-slow"></div>
            </div>
            
            <Wheel 
                options={options} 
                isSpinning={isSpinning}
                setIsSpinning={setIsSpinning}
                onSpinEnd={onSpinEnd}
                winnerIndex={winnerIndex}
            />
            
            {/* Spin Button */}
            <button 
                onClick={handleSpin}
                disabled={isSpinning || options.length === 0}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-b from-[#FFD700] to-[#e67300] rounded-full z-50 flex items-center justify-center font-black text-[#8B0000] border-4 border-white shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform active:scale-95 ${isSpinning ? 'cursor-default opacity-80' : 'hover:scale-110 cursor-pointer animate-pulse'}`}
            >
                QUAY
            </button>
            
            {/* Arrow Pointer */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-white drop-shadow-md z-40 filter drop-shadow"></div>
        </div>
    );
}

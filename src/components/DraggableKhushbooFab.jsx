import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, GripVertical } from 'lucide-react';

export default function DraggableKhushbooFab({ onOpen }) {
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('fragseeker_khushboo_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    hasMoved: false
  });
  const containerRef = useRef(null);

  // Initialize position to bottom-right if not already stored
  useEffect(() => {
    if (!position) {
      const btnWidth = 145;
      const btnHeight = 44;
      const isMobile = window.innerWidth < 768;
      const defaultX = Math.max(12, window.innerWidth - btnWidth - (isMobile ? 16 : 24));
      const defaultY = Math.max(12, window.innerHeight - btnHeight - (isMobile ? 84 : 24));
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [position]);

  // Keep button within screen bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        if (!prev || !containerRef.current) return prev;
        const rect = containerRef.current.getBoundingClientRect();
        const maxX = Math.max(10, window.innerWidth - rect.width - 10);
        const maxY = Math.max(10, window.innerHeight - rect.height - 10);
        return {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(10, prev.y), maxY)
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e) => {
    // Only primary mouse button or touch
    if (e.button !== undefined && e.button !== 0) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const currentX = position?.x ?? (window.innerWidth - 160);
    const currentY = position?.y ?? (window.innerHeight - 80);

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: currentX,
      initialY: currentY,
      hasMoved: false
    };

    setIsDragging(true);

    const onPointerMove = (moveEvent) => {
      const curX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const curY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const deltaX = curX - dragRef.current.startX;
      const deltaY = curY - dragRef.current.startY;

      if (!dragRef.current.hasMoved && (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4)) {
        dragRef.current.hasMoved = true;
      }

      if (dragRef.current.hasMoved) {
        if (moveEvent.cancelable) {
          moveEvent.preventDefault();
        }
        const btnWidth = containerRef.current ? containerRef.current.offsetWidth : 145;
        const btnHeight = containerRef.current ? containerRef.current.offsetHeight : 44;
        
        const newX = Math.min(Math.max(10, dragRef.current.initialX + deltaX), window.innerWidth - btnWidth - 10);
        const newY = Math.min(Math.max(10, dragRef.current.initialY + deltaY), window.innerHeight - btnHeight - 10);

        setPosition({ x: newX, y: newY });
      }
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      if (dragRef.current.hasMoved) {
        setPosition(finalPos => {
          if (finalPos) {
            try {
              localStorage.setItem('fragseeker_khushboo_pos', JSON.stringify(finalPos));
            } catch (err) {}
          }
          return finalPos;
        });
      } else {
        onOpen();
      }
    };

    window.addEventListener('mousemove', onPointerMove, { passive: false });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      style={{
        position: 'fixed',
        left: position ? `${position.x}px` : undefined,
        top: position ? `${position.y}px` : undefined,
        touchAction: 'none',
        zIndex: 45
      }}
      className={`select-none ${!position ? 'fixed bottom-20 md:bottom-6 right-4 md:right-6' : ''} ${
        isDragging ? 'cursor-grabbing scale-105 opacity-90 shadow-2xl' : 'cursor-grab hover:scale-105'
      } transition-transform duration-75`}
    >
      <button
        type="button"
        title="Ask Khushboo — Drag to move anywhere if blocking view"
        className="flex items-center gap-1.5 px-3 py-2 md:px-3.5 md:py-2.5 rounded-full bg-slate-900 text-white dark:bg-zinc-100 dark:text-slate-950 font-mono text-xs font-semibold shadow-xl border border-slate-700/60 dark:border-zinc-300 pointer-events-auto"
      >
        <GripVertical className="w-3 h-3 text-slate-400 dark:text-zinc-500 opacity-60" />
        <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600 fill-amber-400/20" />
        <span className="tracking-wide">Ask Khushboo</span>
      </button>
    </div>
  );
}

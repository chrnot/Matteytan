import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './icons';

interface WidgetWrapperProps {
  id: string;
  title: string;
  children: React.ReactNode;
  initialX: number;
  initialY: number;
  initialWidth?: number;
  initialHeight?: number;
  zIndex: number;
  transparent?: boolean;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
  id,
  title,
  children,
  initialX,
  initialY,
  initialWidth = 400,
  initialHeight = 300,
  zIndex,
  transparent = false,
  onClose,
  onFocus,
  onMove,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // --- DRAGGING LOGIC ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onFocus(id);
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Boundary Checks
        let newY = e.clientY - dragStart.current.y;
        let newX = e.clientX - dragStart.current.x;

        // Prevent going off top screen
        if (newY < 0) newY = 0;
        // Prevent header going completely below screen (keep 50px visible)
        if (newY > window.innerHeight - 50) newY = window.innerHeight - 50;
        
        // Prevent going too far left/right
        if (newX + size.width < 50) newX = 50 - size.width;
        if (newX > window.innerWidth - 50) newX = window.innerWidth - 50;

        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onMove(id, position.x, position.y);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Touch support for dragging logic would need Touch Events here,
      // but for now mouse logic covers desktop/laptop well. 
      // Mobile often handles touches as mouse events but dragging can be tricky with scrolling.
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, id, onMove, position.x, position.y, size.width]);


  // --- RESIZING LOGIC ---
  const handleResizeDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onFocus(id);
      setIsResizing(true);
      resizeStart.current = { 
          x: e.clientX, 
          y: e.clientY, 
          w: size.width, 
          h: size.height 
      };
  };

  useEffect(() => {
      const handleResizeMove = (e: MouseEvent) => {
          if (!isResizing) return;
          const deltaX = e.clientX - resizeStart.current.x;
          const deltaY = e.clientY - resizeStart.current.y;
          
          setSize({
              width: Math.max(280, resizeStart.current.w + deltaX),
              height: Math.max(200, resizeStart.current.h + deltaY)
          });
      };

      const handleResizeUp = () => {
          setIsResizing(false);
      };

      if (isResizing) {
          window.addEventListener('mousemove', handleResizeMove);
          window.addEventListener('mouseup', handleResizeUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleResizeMove);
          window.removeEventListener('mouseup', handleResizeUp);
      };
  }, [isResizing]);


  // Dynamic classes
  // ADDED: max-w and max-h to prevent widgets from being larger than viewport on mobile
  const containerClasses = transparent 
    ? "fixed flex flex-col rounded-xl overflow-visible transition-shadow duration-300 max-w-[98vw] max-h-[90vh]"
    : "fixed flex flex-col bg-white rounded-xl widget-shadow border border-slate-200 overflow-hidden transition-shadow duration-300 max-w-[98vw] max-h-[90vh]";

  return (
    <div
      ref={wrapperRef}
      className={containerClasses}
      style={{
        left: position.x,
        top: position.y,
        width: transparent ? 'auto' : size.width,
        height: transparent ? 'auto' : size.height,
        zIndex: zIndex,
      }}
      onMouseDown={() => onFocus(id)}
    >
      {/* Header */}
      {!transparent && (
        <div
          className="h-10 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-3 cursor-move select-none flex-shrink-0"
          onMouseDown={handleMouseDown}
        >
          <span className="font-semibold text-slate-700 text-sm flex items-center gap-2 truncate pr-4">
            {title}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onClose(id); }}
              className="p-1 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded transition-colors"
            >
              <Icons.Close size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Transparent Mode Drag Handle */}
      {transparent && (
         <div className="absolute -top-10 left-0 flex gap-2 bg-white/90 backdrop-blur border border-slate-200 rounded-lg p-1 shadow-sm z-50">
            <div 
                className="p-1.5 cursor-move text-slate-500 hover:bg-slate-100 rounded"
                onMouseDown={handleMouseDown}
                title="Flytta"
            >
                <Icons.Move size={16} />
            </div>
             <button
              onClick={(e) => { e.stopPropagation(); onClose(id); }}
              className="p-1.5 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded transition-colors"
            >
              <Icons.Close size={16} />
            </button>
         </div>
      )}

      {/* Content Area */}
      <div className={`
        flex-1 relative
        ${transparent ? 'p-0 bg-transparent' : 'p-2 sm:p-4 bg-white/95 backdrop-blur-sm overflow-auto'}
      `}>
        {/* We pass a style to force children to adapt if they use percentages */}
        <div className="h-full w-full">
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    // @ts-ignore
                    return React.cloneElement(child, { isTransparent: transparent });
                }
                return child;
            })}
        </div>
      </div>

      {/* Resize Handle (Bottom Right) */}
      {!transparent && (
          <div 
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-20 flex items-end justify-end p-1 hover:bg-slate-100 rounded-tl"
            onMouseDown={handleResizeDown}
          >
              <div className="w-0 h-0 border-b-[6px] border-r-[6px] border-l-[6px] border-t-[6px] border-b-slate-400 border-r-slate-400 border-l-transparent border-t-transparent opacity-50"></div>
          </div>
      )}
    </div>
  );
};
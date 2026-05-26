import { lazy, Suspense, useState, useEffect, useRef } from 'react';

// Lazy load `@splinetool/react-spline` to optimize initial load times
const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineWrapperProps {
  sceneUrl?: string; // Spline URL
  mobileBreakpoint?: number;
  className?: string;
  isBackground?: boolean; // Set to true for full-screen viewport backgrounds
}

export default function SplineWrapper({
  sceneUrl,
  mobileBreakpoint = 768,
  className = '',
  isBackground = false,
}: SplineWrapperProps) {
  const [loaded, setLoaded] = useState(false);
  const [canLoad, setCanLoad] = useState(false);
  const [error, setError] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkCapabilities = () => {
      const isMobile = window.innerWidth < mobileBreakpoint;
      const isLowEnd = navigator.hardwareConcurrency <= 2;
      
      // WebGL check
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      const hasWebGL = !!gl;

      setCanLoad(!isMobile && !isLowEnd && hasWebGL && !!sceneUrl);
    };

    checkCapabilities();
    window.addEventListener('resize', checkCapabilities);
    return () => window.removeEventListener('resize', checkCapabilities);
  }, [sceneUrl, mobileBreakpoint]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const containerClasses = isBackground
    ? `absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center ${className}`
    : `relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden glass-panel shadow-premium flex items-center justify-center ${className}`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={containerClasses}
      style={{
        background: isBackground 
          ? 'radial-gradient(circle at 50% 50%, rgba(20, 90, 50, 0.05) 0%, rgba(251, 250, 244, 1) 100%)'
          : 'radial-gradient(circle at 50% 50%, rgba(20, 90, 50, 0.03) 0%, rgba(251, 250, 244, 0.8) 100%)',
        zIndex: isBackground ? 0 : undefined,
      }}
    >
      {/* Interactive Background Grid (Fades out when Spline loads successfully) */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none transition-opacity duration-[1000ms]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(30, 107, 59, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 107, 59, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '35px 35px',
          opacity: loaded ? 0 : 0.15,
        }}
      />

      {/* Mouse Tracking Glow Effect (Only active when spline is not loaded yet) */}
      {!loaded && (
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-40 transition-all duration-300 ease-out"
          style={{
            left: `${mousePos.x - 200}px`,
            top: `${mousePos.y - 200}px`,
            background: 'radial-gradient(circle, rgba(214, 194, 122, 0.4) 0%, rgba(30, 107, 59, 0.1) 70%, transparent 100%)',
          }}
        />
      )}

      {/* Futuristic Orbiting Circles Placeholder (Hidden once Spline loads) */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[450px] h-[450px] rounded-full border border-brand-primary/5 border-dashed animate-[spin_50s_linear_infinite]" />
          <div className="absolute w-[350px] h-[350px] rounded-full border border-brand-gold/15 animate-[spin_30s_linear_infinite_reverse]" />
          <div className="absolute w-[250px] h-[250px] rounded-full border border-brand-primary/5 border-dashed" />
          
          {/* Pulsing AI core dot */}
          <div className="absolute w-5 h-5 rounded-full bg-brand-gold animate-ping opacity-75" />
          <div className="absolute w-3 h-3 rounded-full bg-brand-primary animate-pulse" />
        </div>
      )}

      {/* Spline Canvas Engine */}
      {canLoad && !error ? (
        <Suspense fallback={
          <div className="flex flex-col items-center gap-3 relative z-10">
            <div className="w-12 h-12 border-4 border-brand-gold border-t-brand-primary rounded-full animate-spin" />
            <p className="text-xs font-semibold text-brand-primary/60 tracking-widest uppercase font-mono">
              Initializing 3D Longevity Engine...
            </p>
          </div>
        }>
          <Spline
            scene={sceneUrl!}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
              opacity: loaded ? 1 : 0,
              transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'all', // Essential to let mouse hover/clicks reach the interactive 3D model!
            }}
          />
        </Suspense>
      ) : (
        /* Fallback Info Panel when Spline is not active */
        !sceneUrl && (
          <div className="relative z-10 text-center px-6 max-w-lg pointer-events-auto animate-float">
            <div className="px-3.5 py-1.5 rounded-full border border-brand-gold/30 bg-brand-cream/40 text-brand-primary text-xs font-bold tracking-widest uppercase shadow-sm inline-block mb-4">
              3D Interactive Viewport Active
            </div>
            
            <h3 className="font-display text-2xl font-extrabold text-brand-primary tracking-tight mb-3">
              Awaiting Full-Screen Asset
            </h3>
            
            <p className="text-sm text-brand-primary/75 leading-relaxed font-sans mb-4">
              This entire background is structurally reserved for the interactive full-page 3D Spline model. Typography, navigations, and buttons will sit beautifully on top using advanced zero-knowledge layout layering.
            </p>
            
            <div className="text-[10px] text-brand-primary/50 font-mono bg-white/60 border border-brand-primary/10 rounded-lg px-4 py-2 backdrop-blur-sm max-w-xs mx-auto">
              SYS_READY // WebGL2 Context Enabled
            </div>
          </div>
        )
      )}

      {/* Decorative HUD corners (Only visible in normal box mode, or as subtle page decorations in full screen) */}
      {!isBackground && (
        <>
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-brand-primary/20 rounded-tl" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-brand-primary/20 rounded-tr" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-brand-primary/20 rounded-bl" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-brand-primary/20 rounded-br" />
        </>
      )}

      {/* Real-time coordinates decoration (Subtle background details) */}
      {isBackground && (
        <div className="absolute bottom-4 left-8 font-mono text-[9px] text-brand-primary/30 tracking-widest pointer-events-none select-none uppercase z-10">
          MK-SYS // BACKGROUND_ENGINE_ACTIVE
        </div>
      )}
    </div>
  );
}

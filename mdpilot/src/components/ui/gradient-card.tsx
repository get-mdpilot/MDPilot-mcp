'use client';
import { useRef, useState } from 'react';
import { motion } from 'motion/react';

export const GradientCard = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      setRotation({
        x: -(y / rect.height) * 5,
        y: (x / rect.width) * 5,
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <motion.div
        ref={cardRef}
        className="relative rounded-[32px] overflow-hidden"
        style={{
          width: '360px',
          height: '450px',
          transformStyle: 'preserve-3d',
          backgroundColor: '#0e131f',
          boxShadow: '0 -10px 100px 10px rgba(78, 99, 255, 0.25), 0 0 10px 0 rgba(0, 0, 0, 0.5)',
        }}
        initial={{ y: 0 }}
        animate={{
          y: isHovered ? -5 : 0,
          rotateX: rotation.x,
          rotateY: rotation.y,
          perspective: 1000,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {/* Glass reflection */}
        <motion.div
          className="absolute inset-0 z-35 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(2px)',
          }}
          animate={{ opacity: isHovered ? 0.7 : 0.5 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Dark background */}
        <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(180deg, #000000 0%, #000000 70%)' }} />

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Bottom glow */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-2/3 z-20"
          style={{
            background: `radial-gradient(ellipse at bottom right, rgba(172, 92, 255, 0.7) -10%, rgba(79, 70, 229, 0) 70%),
              radial-gradient(ellipse at bottom left, rgba(56, 189, 248, 0.7) -10%, rgba(79, 70, 229, 0) 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{ opacity: isHovered ? 0.9 : 0.8 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Bottom border glow */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] z-25"
          style={{
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.05) 100%)',
          }}
          animate={{
            boxShadow: isHovered
              ? '0 0 20px 4px rgba(172, 92, 255, 0.9), 0 0 30px 6px rgba(138, 58, 185, 0.7), 0 0 40px 8px rgba(56, 189, 248, 0.5)'
              : '0 0 15px 3px rgba(172, 92, 255, 0.8), 0 0 25px 5px rgba(138, 58, 185, 0.6), 0 0 35px 7px rgba(56, 189, 248, 0.4)',
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Card content */}
        <motion.div className="relative flex flex-col h-full p-8 z-40">
          <motion.div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
            style={{
              background: 'linear-gradient(225deg, #171c2c 0%, #121624 100%)',
              overflow: 'hidden',
            }}
            animate={{
              boxShadow: isHovered
                ? '0 8px 16px -2px rgba(0, 0, 0, 0.3), inset 2px 2px 5px rgba(255, 255, 255, 0.15), inset -2px -2px 5px rgba(0, 0, 0, 0.7)'
                : '0 6px 12px -2px rgba(0, 0, 0, 0.25), inset 1px 1px 3px rgba(255, 255, 255, 0.12), inset -2px -2px 4px rgba(0, 0, 0, 0.5)',
              y: isHovered ? -2 : 0,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-center w-full h-full relative z-10">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path d="M8 0L9.4 5.4L14.8 5.4L10.6 8.8L12 14.2L8 10.8L4 14.2L5.4 8.8L1.2 5.4L6.6 5.4L8 0Z" fill="white" />
              </svg>
            </div>
          </motion.div>

          <motion.div
            className="mb-auto"
            animate={{ y: isHovered ? -2 : 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <motion.h3
              className="text-2xl font-medium text-white mb-3"
              style={{ letterSpacing: '-0.01em', lineHeight: 1.2 }}
              animate={{ textShadow: isHovered ? '0 2px 4px rgba(0,0,0,0.2)' : 'none' }}
            >
              AI-Powered Inbox Sorting
            </motion.h3>
            <motion.p
              className="text-sm mb-6 text-gray-300"
              style={{ lineHeight: 1.5, fontWeight: 350 }}
              animate={{ opacity: isHovered ? 0.9 : 0.85 }}
            >
              OpenMail revolutionizes email management with AI-driven sorting, boosting productivity and accessibility
            </motion.p>
            <motion.a
              href="#"
              className="inline-flex items-center text-white text-sm font-medium"
              whileHover={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))' }}
            >
              Learn More
              <motion.svg
                className="ml-1 w-4 h-4"
                viewBox="0 0 16 16" fill="none"
                animate={{ x: isHovered ? 4 : 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

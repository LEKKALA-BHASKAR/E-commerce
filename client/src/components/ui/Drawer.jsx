import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Drawer({ open, onClose, side = 'right', children, title, width = 'w-full sm:w-[420px]' }) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  const fromX = side === 'right' ? '100%' : '-100%';
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={onClose} />
          <motion.aside
            initial={{ x: fromX }} animate={{ x: 0 }} exit={{ x: fromX }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className={`glass-strong absolute top-0 bottom-0 ${side === 'right' ? 'right-0' : 'left-0'} ${width} flex flex-col rounded-none sm:${side === 'right' ? 'rounded-l-3xl' : 'rounded-r-3xl'}`}
          >
            <header className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="font-display text-lg">{title}</h3>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10 transition" aria-label="Close"><X size={18} /></button>
            </header>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

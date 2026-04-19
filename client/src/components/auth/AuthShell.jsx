import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function AuthShell({ eyebrow, title, sub, children, sideTitle, sideBody, sideImage, footer }) {
  return (
    <section className="container py-10 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-stretch">
        <div className="order-2 lg:order-1 flex flex-col justify-center">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-ink-300 hover:text-gold transition-colors">
            <ArrowLeft size={12} /> Back to store
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md"
          >
            {eyebrow && <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>}
            <h1 className="font-display text-4xl sm:text-5xl">{title}</h1>
            {sub && <p className="mt-3 text-sm text-ink-300">{sub}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-sm text-ink-300">{footer}</div>}
          </motion.div>
        </div>

        <aside className="order-1 lg:order-2 relative overflow-hidden rounded-3xl min-h-[260px] lg:min-h-[640px]">
          <img
            src={sideImage || 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1400&q=80'}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink-900/95 via-ink-900/60 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end p-8 lg:p-12">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">The Maison</p>
            <h2 className="mt-3 font-display text-3xl lg:text-4xl">{sideTitle || 'Quietly extraordinary.'}</h2>
            <p className="mt-3 max-w-sm text-sm text-ink-100/90">{sideBody || 'A curated edit of objects designed to outlast the season — and the trend.'}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

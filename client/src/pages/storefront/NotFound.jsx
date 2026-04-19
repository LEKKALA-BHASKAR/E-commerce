import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="container relative py-24 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Error 404</p>
      <h1 className="mt-4 font-display text-[20vw] sm:text-[12rem] leading-none bg-gradient-to-b from-gold to-transparent bg-clip-text text-transparent">
        404
      </h1>
      <p className="mx-auto mt-4 max-w-md font-display text-2xl">A piece you sought has wandered off.</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-300">
        The page you're looking for doesn't exist or has been quietly retired from the collection.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/"><Button><ArrowLeft size={16} /> Take me home</Button></Link>
        <Link to="/shop"><Button variant="ghost">Browse the edit</Button></Link>
      </div>
    </section>
  );
}

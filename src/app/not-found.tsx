import { ButtonLink } from '@/src/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center site-container py-24 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-4">
        Error 404
      </p>
      <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-neutral-950 mb-4">
        Lost in Softness
      </h1>
      <p className="text-neutral-500 max-w-md mb-10">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/" size="lg">
          Back to shop
        </ButtonLink>
        <ButtonLink href="/collections" variant="secondary" size="lg">
          Collections
        </ButtonLink>
      </div>
    </div>
  );
}

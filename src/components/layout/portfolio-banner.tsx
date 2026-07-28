export function PortfolioBanner() {
  return (
    <div className="bg-black text-white">
      <div className="site-container py-2.5">
        <p className="text-[11px] sm:text-xs leading-relaxed font-sans text-neutral-200">
          <span className="font-semibold text-white">Portfolio project</span>
          {' — '}
          this is not a real store. Prices, checkout and shipping are for demo purposes only. Interested
          in the work?{' '}
          <a
            href="mailto:mateus.fneiva@gmail.com"
            className="underline underline-offset-2 text-white hover:text-neutral-300"
          >
            Contact me
          </a>
          .
        </p>
      </div>
    </div>
  );
}

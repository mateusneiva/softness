export function PortfolioBanner() {
  return (
    <div className="bg-black text-white">
      <div className="site-container py-2 sm:py-2.5">
        <p className="font-sans text-[10px] leading-relaxed text-neutral-200 sm:text-xs">
          <span className="font-semibold text-white">Portfolio project</span>
          {' — '}
          this is not a real store. Prices, checkout and shipping are for demo purposes only. Interested
          in the work?{' '}
          <a
            href="mailto:mateus.fneiva@gmail.com"
            className="text-white underline underline-offset-2 hover:text-neutral-300"
          >
            Contact me
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="flex-1 site-container py-12 lg:py-16 max-w-3xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">Legal</p>
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-neutral-950 mb-6">
        Terms of Service
      </h1>
      <div className="space-y-4 text-sm text-neutral-500 leading-relaxed font-sans">
        <p>
          By using Softness you agree to browse, purchase and manage your account under these terms.
        </p>
        <p>
          Product availability, pricing and promotions may change without notice. Orders are confirmed
          only after successful payment authorization.
        </p>
        <p>
          You are responsible for keeping your login credentials secure and for providing accurate shipping
          information.
        </p>
        <p>
          Softness is a portfolio storefront demonstration. For questions, reach out at{' '}
          <a href="mailto:hello@softness.com" className="text-neutral-950 hover:text-neutral-700">
            hello@softness.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}

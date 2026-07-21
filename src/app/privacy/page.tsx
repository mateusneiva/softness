export default function PrivacyPage() {
  return (
    <div className="flex-1 site-container py-12 lg:py-16 max-w-3xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2">Legal</p>
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-neutral-950 mb-6">
        Privacy Policy
      </h1>
      <div className="space-y-4 text-sm text-neutral-500 leading-relaxed font-sans">
        <p>
          Softness collects only the information needed to create your account, process orders and improve
          your shopping experience.
        </p>
        <p>
          Account details such as your name, email, birth date and shipping addresses are stored securely
          and are never sold to third parties.
        </p>
        <p>
          Payment processing is handled by Stripe when configured. Softness does not store full card numbers
          on its own servers.
        </p>
        <p>
          You can request access to or deletion of your personal data by contacting{' '}
          <a href="mailto:hello@softness.com" className="text-neutral-950 hover:text-neutral-700">
            hello@softness.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}

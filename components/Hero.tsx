export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 bg-navy text-cream overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(242,234,220,0.06) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* badge decorativo: círculo tracejado, motivo "corte limpo" do mockup */}
      <div className="hidden md:flex flex-col items-center absolute top-32 right-24 text-lime">
        <span className="font-mono text-[10px] tracking-widest lowercase mb-3">corte limpo</span>
        <div className="w-32 h-32 rounded-full border border-dashed border-lime/60 flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-lime animate-pulse" />
        </div>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-cream/70 mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-lime" />
        São Luís · Brasil — Backend, APIs e Sistemas
      </div>

      <h1 className="font-display font-black leading-[0.95] text-[15vw] md:text-[7vw]">
        Back-end com
        <br />
        <span className="font-serif italic font-normal text-lime">presença.</span>
      </h1>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between mt-12 gap-8">
        <div className="flex items-center gap-3 max-w-xs">
          <span className="block w-16 h-px bg-cream/40" />
          <span className="font-mono text-xs tracking-widest">01 / 05</span>
        </div>
        <p className="max-w-sm text-cream/80 text-sm leading-relaxed">
          Sou Gabriel, desenvolvedor back-end Graduando em Ciências e Tecnologia (UFMA). Construo
          APIs e sistemas que resolvem o problema antes de aparecer na tela.
        </p>
      </div>
    </section>
  );
}

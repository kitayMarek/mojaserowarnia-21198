import { Facebook, Mail } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Serowarstwo",
      links: [
        { label: "Bazy kultur", href: "/baza-kultur" },
        { label: "Przepisy", href: "/przepisy" },
        { label: "Poradniki", href: "/poradniki" },
        { label: "Słownik terminów", href: "/slownik" },
        { label: "Narzędzia", href: "/narzedzia" },
      ],
    },
    {
      title: "Prawo",
      links: [
        { label: "Prawo dla serowarów", href: "/prawo" },
        { label: "RHD", href: "/prawo/rhd" },
        { label: "MOL", href: "/prawo/mol" },
        { label: "Rzeźnia rolnicza", href: "/prawo/rzeznia-rolnicza" },
      ],
    },
    {
      title: "Narzędzia",
      links: [
        { label: "Kalkulator podpuszczki", href: "/kalkulator-beaugel" },
        { label: "Gdzie kupić podpuszczkę", href: "/gdzie-kupic-podpuszczke" },
        { label: "Siła podpuszczki", href: "/sila-podpuszczki" },
        { label: "System ewidencji", href: "/dashboard" },
        { label: "Automatyzacja Social Media", href: "/automatyzacja-social-media" },
        // Jedyny link do pasz w Serowarni od 28.10.2026 (decyzja Marka 25.10.2026: poza menu i wyszukiwarką).
        { label: "Kalkulator paszy: mojapasza.com", href: "https://mojapasza.com/kalkulator" },
      ],
    },
    {
      title: "O projekcie",
      links: [
        // Bez „O portalu” i „Współpraca”: prowadziły do kotwic, których nie ma na żadnej stronie
        // (audyt przed zgłoszeniem do OpenAI, 24.10.2026).
        { label: "Kontakt", href: "/kontakt" },
        { label: "Asystenci AI", href: "/asystenci-ai" },
        { label: "Nota prawna", href: "/nota-prawna" },
        { label: "Polityka prywatności", href: "/nota-prawna#prywatnosc" },
        { label: "Warunki serwera MCP", href: "/warunki-mcp" },
      ],
    },
  ];

  // Tylko prawdziwe adresy: profil z sameAs w index.html i formularz kontaktu. YouTube i Instagram
  // prowadziły do „#”, bo serwis takich profili nie ma.
  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/serowar.warminski", label: "Facebook", zewnetrzny: true },
    { icon: Mail, href: "/kontakt", label: "Napisz do nas", zewnetrzny: false },
  ];

  return (
    <footer className="bg-accent text-accent-foreground pt-12 pb-8" role="contentinfo">
      <div className="container mx-auto px-4">
        <hr className="border-0 border-t-[3px] border-double border-accent-foreground/25 mb-10" />
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <svg viewBox="0 0 46 26" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-7 shrink-0 text-primary" aria-hidden="true">
                <path d="M4 20 L23 6 L42 20 Z" strokeLinejoin="round" />
                <circle cx="17" cy="16" r="2" />
                <circle cx="27" cy="14" r="2.6" />
                <circle cx="33" cy="18" r="1.6" />
                <path d="M4 20 h38" />
              </svg>
              <div>
                <h3 className="text-xl font-display">Moja Serowarnia</h3>
              </div>
            </div>
            <p className="text-sm text-accent-foreground/80 mb-6 leading-relaxed">
              Wiedza o serowarstwie domowym i zagrodowym: kultury, przepisy, kalkulatory i prawo dla małych gospodarstw.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    {...(social.zewnetrzny ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="w-10 h-10 border border-accent-foreground/20 hover:bg-primary hover:border-primary flex items-center justify-center transition-colors group"
                  >
                    <Icon className="h-5 w-5 text-accent-foreground group-hover:text-primary-foreground transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-[11px] uppercase tracking-[0.2em] text-accent-foreground/60 border-b border-accent-foreground/20 pb-2 mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-accent-foreground/80 hover:text-primary transition-colors inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-accent-foreground/10">
          {/* Przeniesione z banera zgód (22.10.2026), żeby baner mówił tylko o zgodzie. */}
          <p className="text-sm text-accent-foreground/70 text-center md:text-left mb-4">
            Treści mają charakter informacyjny. Dawki, skład i przechowywanie zawsze sprawdzaj u producenta (
            <a href="/nota-prawna" className="underline hover:text-primary transition-colors">nota prawna</a>).
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-accent-foreground/70">
            <p>© 2025 Moja Serowarnia. Wszelkie prawa zastrzeżone.</p>
            <p>Stworzone z pasją dla polskich serowarów 🇵🇱</p>
            <p>
              Built with{" "}
              <a
                href="https://lovable.dev/invite/9S48PRO"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline transition-colors"
              >
                Lovable
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

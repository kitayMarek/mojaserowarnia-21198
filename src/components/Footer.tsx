import { Facebook, Youtube, Instagram, Mail } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Serowarstwo",
      links: [
        { label: "Bazy kultur", href: "/baza-kultur" },
        { label: "Przepisy", href: "/przepisy" },
        { label: "Poradniki", href: "/poradniki" },
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
      ],
    },
    {
      title: "O projekcie",
      links: [
        { label: "O portalu", href: "#o-nas" },
        { label: "Kontakt", href: "/kontakt" },
        { label: "Nota prawna", href: "/nota-prawna" },
        { label: "Współpraca", href: "#wspolpraca" },
        { label: "Polityka prywatności", href: "#prywatnosc" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="bg-accent text-accent-foreground pt-16 pb-8" role="contentinfo">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center shadow-warm">
                <span className="text-2xl">🧀</span>
              </div>
              <div>
                <h3 className="text-xl font-display font-bold">Moja Serowarnia</h3>
              </div>
            </div>
            <p className="text-sm text-accent-foreground/80 mb-6 leading-relaxed">
              Twoje centrum wiedzy o serowarstwie. Profesjonalny portal dla polskich serowarów.
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
                    className="w-10 h-10 rounded-full bg-accent-foreground/10 hover:bg-primary flex items-center justify-center transition-colors group"
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
              <h4 className="font-display font-bold text-lg mb-4">{section.title}</h4>
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

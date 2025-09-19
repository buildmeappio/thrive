import Image from '@/components/Image';
import { MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { href: '#', label: 'Home', active: true },
    { href: '#', label: 'About Us' },
    { href: '#', label: 'Our Services' },
    { href: '#', label: 'How it Works' },
    { href: '#', label: "FAQ's" },
    { href: '#', label: 'Contact Us' },
  ];

  const helpLinks = [
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms & Conditions' },
  ];

  const contacts = [
    { icon: MapPin, content: 'Canada Ontario', href: null },
    { icon: Mail, content: 'info@thrive.com', href: 'mailto:info@thrive.com' },
    { icon: Phone, content: '+44 (0) 1234 234 23', href: 'tel:+441012342423' },
  ];

  const LinkSection = ({
    title,
    links,
  }: {
    title: string;
    links: { href: string; label: string; active?: boolean }[];
  }) => (
    <div>
      <h3 className="mb-6 text-lg font-semibold text-white">{title}</h3>
      <ul className="space-y-3">
        {links.map((link, i) => (
          <li key={i}>
            <a
              href={link.href}
              className={
                link.active
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text font-medium text-transparent'
                  : 'text-gray-300 transition-colors duration-200 hover:text-white'
              }
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-indigo-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div>
            <Image
              src="https://public-thrive-assets.s3.eu-north-1.amazonaws.com/footerLogo.png"
              alt="Thrive Footer Logo"
              width={150}
              height={50}
              priority
            />
            <p className="text-sm leading-relaxed text-gray-300">
              Thrive is a trusted bridge connecting claimants and legal counsels, healthcare
              providers and insurers—delivering seamless, efficient, and transparent Independent
              Medical Examinations (IMEs).
            </p>
          </div>

          <LinkSection title="Quick Links" links={quickLinks} />
          <LinkSection title="Help" links={helpLinks} />

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white">Contact Us</h3>
            <div className="space-y-4">
              {contacts.map(({ icon: Icon, content, href }, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400">
                    <Icon className="h-3 w-3 text-indigo-950" />
                  </div>
                  {href ? (
                    <a
                      href={href}
                      className="text-gray-300 transition-colors duration-200 hover:text-white"
                    >
                      {content}
                    </a>
                  ) : (
                    <span className="text-gray-300">{content}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <p className="text-center text-gray-600">
            © Copyright 2025 | Thrive Assessment & Care | All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

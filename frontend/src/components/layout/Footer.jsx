import React from 'react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const socialLinks = [
  {
    href: 'https://x.com/WrittenbyAlper',
    label: 'Twitter',
    icon: <FaTwitter className="w-5 h-5" />,
  },
];

const Footer = () => (
  <footer className="relative bg-[#101624] overflow-hidden mt-12">
    {/* Grid background */}
    <div className="absolute inset-0 z-0">
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="footer-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#2a3140"
              strokeWidth="2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footer-grid)" />
      </svg>
    </div>
    <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center text-sm text-slate-300">
      <div className="mb-2 md:mb-0 w-full md:w-auto">
        <span className="font-logo font-bold text-white text-lg">Open<span className="italic font-serif font-normal">Wall</span></span> &copy; {new Date().getFullYear()} &middot; Tüm hakları saklıdır.
      </div>
      <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
        {socialLinks.map(link => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="hover:text-brand-orange transition-colors"
          >
            {link.icon}
          </a>
        ))}
        <a
          href="mailto:info@openwall.com"
          className="ml-2 hover:text-brand-orange transition-colors text-[15px] font-medium"
        >
          İletişim
        </a>
      </div>
    </div>
  </footer>
);

export default Footer; 
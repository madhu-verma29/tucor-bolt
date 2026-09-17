import React from 'react';

import AppLogo from '@/components/ui/AppLogo';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  platform: [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'For Sellers', href: '#for-sellers' },
    { label: 'For Buyers', href: '#for-buyers' },
    { label: 'Pricing', href: '#' },
    { label: 'FAQ', href: '#faq' },
  ],
  company: [
    { label: 'About TUCOR', href: '#' },
    { label: 'Sustainability', href: '#sustainability' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'FSSAI Compliance', href: '#' },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <AppLogo size={36} />
              <span className="font-extrabold text-xl text-background">TUCOR</span>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-background/60 max-w-xs">
              India's trusted managed marketplace for used cooking oil recovery — connecting verified sellers with certified buyers through a transparent, end-to-end platform.
            </p>
            <div className="flex flex-col gap-2 text-sm text-background/60">
              <div className="flex items-center gap-2">
                <Mail size={14} />
                <span>support@tucor.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} />
                <span>+91 80 6900 0099</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>Bengaluru, Karnataka, India</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks)?.map(([category, links]) => (
            <div key={`footer-cat-${category}`}>
              <div className="text-xs font-semibold tracking-widest uppercase text-background/40 mb-4">
                {category?.charAt(0)?.toUpperCase() + category?.slice(1)}
              </div>
              <div className="flex flex-col gap-2.5">
                {links?.map((link) => (
                  <a
                    key={`footer-link-${link?.label}`}
                    href={link?.href}
                    className="text-sm text-background/60 hover:text-background transition-colors duration-150"
                  >
                    {link?.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-background/40">
            <Leaf size={14} className="text-accent" />
            <span>© 2026 TUCOR Technologies Pvt. Ltd. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-background/30">
            <span>FSSAI Compliant</span>
            <span>·</span>
            <span>ISO 14001 Aligned</span>
            <span>·</span>
            <span>Make in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
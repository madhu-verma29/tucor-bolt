'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    id: 'faq-who-sells',
    q: 'Who can sell UCO on TUCOR?',
    a: 'Any FSSAI-registered food business that generates used cooking oil — restaurants, hotels, cloud kitchens, canteens, caterers, and food processors. You must be GST-registered and able to provide address proof.',
  },
  {
    id: 'faq-price',
    q: 'How is the price per liter determined?',
    a: 'TUCOR sets a market-aligned rate based on oil type, quality grade (A/B/C), and regional demand. Current rates range from ₹18–₹33 per liter. Rates are updated weekly and communicated to all registered sellers.',
  },
  {
    id: 'faq-payment-timeline',
    q: 'When do sellers get paid?',
    a: 'Payment is initiated within 2 business days of pickup confirmation and typically settles within 7 business days. Sellers receive a detailed invoice and payment reference for every transaction.',
  },
  {
    id: 'faq-anonymity',
    q: 'Why don\'t buyers and sellers communicate directly?',
    a: 'TUCOR operates as a managed intermediary to ensure fair pricing, quality assurance, and compliance for both parties. This model prevents price manipulation and protects both sellers and buyers from fraudulent transactions.',
  },
  {
    id: 'faq-quality',
    q: 'How is UCO quality graded?',
    a: 'TUCOR agents inspect UCO at the point of collection. Grade A is filtered, low-FFA oil suitable for biodiesel. Grade B has moderate impurities. Grade C includes heavily degraded oil. Grade affects pricing but all grades are accepted.',
  },
  {
    id: 'faq-pickup-frequency',
    q: 'How often are pickups scheduled?',
    a: 'Sellers can choose weekly, bi-weekly, or monthly collection frequency when creating a listing. TUCOR schedules pickups based on volume thresholds and route optimization. Minimum pickup volume is 50 liters.',
  },
  {
    id: 'faq-verification',
    q: 'How long does business verification take?',
    a: 'Verification typically completes within 24–48 hours of document submission. You\'ll receive an email confirmation. During peak periods, verification may take up to 72 hours.',
  },
  {
    id: 'faq-impact-cert',
    q: 'Can I get a sustainability certificate for my business?',
    a: 'Yes. Verified sellers with at least 3 completed collections can download a TUCOR Impact Certificate showing total UCO recovered and estimated CO₂ offset. This is accepted by several CSR and ESG reporting frameworks.',
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>('faq-who-sells');

  return (
    <section id="faq" className="py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">FAQ</p>
            <h2 className="text-display-md text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Everything you need to know about selling and buying UCO through TUCOR.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {faqs?.map((faq) => {
              const isOpen = openId === faq?.id;
              return (
                <div
                  key={faq?.id}
                  className={`card overflow-hidden transition-all duration-200 ${isOpen ? 'shadow-card-hover' : ''}`}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq?.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/40 transition-colors duration-150"
                  >
                    <span className="font-semibold text-foreground text-sm pr-4">{faq?.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 animate-fade-in-up">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq?.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
'use client';

import React from 'react';
import { Check, Sparkles, Zap, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (plan: string) => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for testing our AI virality detector on your first videos.',
      badge: 'Free Tier',
      highlighted: false,
      features: [
        '10 free video clips per month',
        '720p HD MP4 video rendering',
        'Automatic 9:16 vertical cropping',
        'Dynamic animated captions',
        'Basic virality scoring',
        'Standard processing queue'
      ],
      buttonText: 'Start Free — No Card',
      buttonClass: 'bg-surface hover:bg-card text-white border border-border hover:border-electric'
    },
    {
      name: 'Pro Creator',
      price: '$29',
      period: 'per month',
      desc: 'For YouTubers, podcasters, and editors publishing daily viral shorts.',
      badge: 'Most Popular',
      highlighted: true,
      features: [
        '300 video credits per month (~30 long videos)',
        '1080x1920 60FPS Ultra HD exports',
        'Advanced face-tracking pan & scan',
        'Hormozi, ClipHi & custom subtitle styles',
        'AI viral hook sentiment detection',
        'Multi-platform one-click ZIP exports',
        'Automatic YouTube Shorts metadata & tags',
        'Priority GPU rendering pipeline'
      ],
      buttonText: 'Get Pro Access Now',
      buttonClass: 'bg-neon hover:bg-neon-hover text-black font-black shadow-lg shadow-neon/30'
    },
    {
      name: 'Studio Agency',
      price: '$79',
      period: 'per month',
      desc: 'High-volume production for creator agencies and media channels.',
      badge: 'Agency Power',
      highlighted: false,
      features: [
        '1,000 video credits per month',
        'Unlimited simultaneous renders',
        'Custom font & brand watermarks',
        'Direct YouTube / TikTok auto-scheduler',
        'Dedicated GPU instance',
        'Full REST API & webhook access',
        'Dedicated 24/7 Slack support'
      ],
      buttonText: 'Upgrade To Studio',
      buttonClass: 'bg-surface hover:bg-card text-white border border-border hover:border-electric'
    }
  ];

  return (
    <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-bold text-text-muted uppercase tracking-widest">
          <Zap className="w-3.5 h-3.5 text-neon" />
          <span>Simple Transparent Pricing</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
          INVEST IN <span className="text-neon">MORE VIEWS</span>
        </h2>
        <p className="text-sm sm:text-base text-text-muted">
          Save 15+ hours of manual editing per video. Pay only for what you generate, upgrade or cancel anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
              plan.highlighted
                ? 'bg-gradient-to-b from-[#181C38] via-[#121528] to-[#0A0C18] border-2 border-electric shadow-2xl shadow-electric/25 scale-[1.02] lg:-translate-y-2'
                : 'bg-card border border-border hover:border-electric/60 hover:-translate-y-1'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-neon text-black shadow-md">
                {plan.badge}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                  {plan.name}
                </h3>
                {!plan.highlighted && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="mb-4">
                <span className="font-display font-black text-4xl sm:text-5xl text-white">
                  {plan.price}
                </span>
                <span className="text-xs text-text-muted ml-2 font-medium">
                  / {plan.period}
                </span>
              </div>

              <p className="text-xs text-text-muted leading-relaxed mb-6 font-normal">
                {plan.desc}
              </p>

              <div className="space-y-3 pt-6 border-t border-border/80 mb-8">
                {plan.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-xs text-text-primary">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlighted ? 'text-neon' : 'text-electric'}`} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectPlan(plan.name)}
              className={`w-full py-3.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${plan.buttonClass}`}
            >
              <span>{plan.buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

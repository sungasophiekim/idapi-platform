'use client';

import { useState } from 'react';
import { useLang } from '@/lib/i18n';

export default function InsightsPage() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="max-w-[680px] mb-14">
          <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep/60 mb-3">
            {t('인사이트', 'Insights')}
          </div>
          <h1 className="text-[38px] font-bold tracking-tight leading-tight text-gray-900">
            {t('디지털·AI 공공 인프라를 읽는 관점', 'Perspectives on digital & AI public infrastructure')}
          </h1>
          <p className="mt-4 text-[15px] text-gray-500 leading-relaxed">
            {t(
              'iDAPI 연구진의 짧은 분석과 정책 브리핑, 그리고 뉴스레터 아카이브를 제공합니다.',
              'Short analyses and policy briefings from iDAPI researchers, plus the newsletter archive.',
            )}
          </p>
        </div>

        <div className="border border-border rounded-xl p-10 bg-bg-alt text-center mb-16">
          <p className="text-[14px] text-gray-500">
            {t('인사이트 콘텐츠를 준비 중입니다.', 'Insights content is coming soon.')}
          </p>
        </div>

        {/* Subscribe */}
        <div id="subscribe" className="scroll-mt-24 bg-green-deep text-white rounded-2xl px-8 py-12 md:px-14">
          <div className="max-w-[560px]">
            <h2 className="text-[26px] font-bold tracking-tight">
              {t('뉴스레터 구독', 'Subscribe to our newsletter')}
            </h2>
            <p className="mt-3 text-[14px] text-white/60 leading-relaxed">
              {t(
                '디지털·AI 공공 인프라 정책 동향을 정기적으로 받아보세요.',
                'Get regular briefings on digital & AI public infrastructure policy.',
              )}
            </p>

            {status === 'done' ? (
              <p className="mt-6 text-[15px] font-medium text-white">
                {t('구독해 주셔서 감사합니다.', 'Thanks for subscribing.')}
              </p>
            ) : (
              <form onSubmit={subscribe} className="mt-6 flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('이메일 주소', 'Email address')}
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 text-[14px] outline-none"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-3 bg-white text-green-deep text-[14px] font-bold rounded-lg hover:bg-white/90 transition-colors disabled:opacity-60"
                >
                  {status === 'loading' ? t('처리 중…', 'Sending…') : t('구독', 'Subscribe')}
                </button>
              </form>
            )}
            {status === 'error' && (
              <p className="mt-3 text-[13px] text-red-200">
                {t('구독에 실패했습니다. 다시 시도해 주세요.', 'Subscription failed. Please try again.')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { HiArrowRight, HiChartBarSquare, HiSparkles } from 'react-icons/hi2';

function ActionCard({
  title,
  description,
  href,
  status,
  disabled = false,
}: {
  title: string;
  description: string;
  href?: string;
  status: string;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={[
        'group relative overflow-hidden rounded-3xl border p-6 transition duration-300',
        disabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-100/90 opacity-80'
          : 'cursor-pointer border-slate-200 bg-white hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl',
      ].join(' ')}
    >
      <div
        className={[
          'absolute inset-x-0 top-0 h-1',
          disabled ? 'bg-slate-300' : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400',
        ].join(' ')}
      />

      <div className="mb-8 flex items-start justify-between gap-4">
        <div
          className={[
            'rounded-2xl p-3',
            disabled ? 'bg-slate-200 text-slate-500' : 'bg-blue-50 text-blue-600',
          ].join(' ')}
        >
          {disabled ? <HiSparkles className="h-7 w-7" /> : <HiChartBarSquare className="h-7 w-7" />}
        </div>
        <span
          className={[
            'rounded-full px-3 py-1 text-xs font-semibold',
            disabled ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700',
          ].join(' ')}
        >
          {status}
        </span>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div
        className={[
          'mt-8 inline-flex items-center gap-2 text-sm font-semibold',
          disabled ? 'text-slate-500' : 'text-blue-600',
        ].join(' ')}
      >
        <span>{disabled ? 'Coming soon' : 'Open dashboard'}</span>
        <HiArrowRight className={['h-4 w-4', disabled ? '' : 'transition group-hover:translate-x-1'].join(' ')} />
      </div>
    </div>
  );

  if (disabled || !href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
            Vizual Graphics Ltd
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Choose where you want to go
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Start from the dashboard or keep the second card ready for the next flow.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ActionCard
            title="Dashboard"
            description="Open the main dashboard to manage client assets, uploads, and the current visual workflow."
            href="/dashboard"
            status="Available"
          />
          <ActionCard
            title="Client Upload"
            description="Open the client upload page so clients can send image files directly into the asset pipeline."
            href="/image/upload"
            status="Available"
          />
        </div>
      </div>
    </main>
  );
}

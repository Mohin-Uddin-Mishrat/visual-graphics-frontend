'use client';

import { useGetClientAssetsQuery, useDeleteClientAssetMutation, type ClientAsset } from '@/lib/clientAssetsApi';

function DashboardCard({ title, value, change, color }: { title: string; value: string; change: string; color: string }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="text-sm font-semibold text-slate-500">{title}</div>
      <div className="mt-3 text-3xl font-bold text-slate-900">{value}</div>
      <div className={`mt-2 text-xs font-medium rounded-full px-2 py-1 inline-flex items-center ${color}`}>{change}</div>
    </div>
  );
}

function getDaysSinceUpload(createdAt: string): number {
  const uploadDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - uploadDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useGetClientAssetsQuery();
  const [deleteClientAsset, { isLoading: isDeleting }] = useDeleteClientAssetMutation();

  const total = data?.length ?? 0;
  const recent: ClientAsset[] = data?.slice(0, 3) ?? [];

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client asset?')) {
      try {
        await deleteClientAsset(id).unwrap();
        refetch(); // Refresh the data after deletion
      } catch (error) {
        console.error('Failed to delete asset:', error);
        alert('Failed to delete asset. Please try again.');
      }
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Live client asset status from API</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Client Assets" value={String(total)} change="+50% this week" color="bg-emerald-100 text-emerald-700" />
        <DashboardCard title="Pending Assets" value="5" change="-9% from yesterday" color="bg-amber-100 text-amber-700" />
        <DashboardCard title="Completed" value="27" change="+14%" color="bg-blue-100 text-blue-700" />
        <DashboardCard title="Errors" value="0" change="0%" color="bg-red-100 text-red-700" />
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Recent Client Assets</h2>

        {isLoading && <div className="p-6 text-center text-slate-600">Loading assets...</div>}
        {isError && <div className="p-6 text-center text-red-600">Error loading assets: {String(error)}</div>}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recent.map((item) => (
              <article key={item.id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm group">
                <img
                  src={item.imageUrl}
                  alt={`${item.clientName} asset`}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900">{item.clientName}</h3>
                  <p className="text-sm text-slate-500 mt-1">Uploaded: {new Date(item.createdAt).toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                      {getDaysSinceUpload(item.createdAt)} days ago
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete asset"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {recent.length === 0 && <div className="p-6 text-center text-slate-600">No recent assets found.</div>}
          </div>
        )}
      </section>

      <section className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-3xl border border-indigo-100 p-6 shadow-inner">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Overview</h2>
        <p className="text-slate-600 leading-relaxed">
          This dashboard is connected to <code className="rounded bg-slate-100 px-1 py-px">{process.env.NEXT_PUBLIC_API_BASE_URL}</code> and shows live client assets.
          Keep an eye on freshness, capacity, and feedback loops for improved upload handling.
        </p>
      </section>
    </div>
  );
}

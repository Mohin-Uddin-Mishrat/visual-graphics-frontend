'use client';

import { useGetClientAssetsQuery, useDeleteClientAssetMutation } from '@/redux';
import { getAssetFileName, getClientAssetPreviewSrc, getClientAssetShareUrl, isZipAssetUrl } from '@/lib/clientAssetFiles';
import { useToast } from '@/lib/toast';
import { HiOutlineClipboardDocument } from 'react-icons/hi2';

function getDaysSinceUpload(createdAt: string): number {
  const uploadDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - uploadDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function ListOfAssetPage() {
  const { data, isLoading, isError, error } = useGetClientAssetsQuery();
  const [deleteClientAsset, { isLoading: isDeleting }] = useDeleteClientAssetMutation();
  const { addToast } = useToast();
  const assets = data ?? [];

  const handleDelete = async (id: number) => {
    try {
      await deleteClientAsset(id).unwrap();
      addToast('Client asset deleted successfully', 'success');
    } catch (deleteError) {
      console.error('Failed to delete asset:', deleteError);
      addToast('Failed to delete asset. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(14,165,233,0.14),_rgba(59,130,246,0.08)_40%,_rgba(139,92,246,0.14))] px-6 py-7 shadow-[0_24px_80px_rgba(59,130,246,0.1)] sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Asset Library</p>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">List Of Assets</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">Browse every uploaded file with a cleaner, brighter control surface.</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total Assets</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{assets.length}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">Table View</p>
          <p className="mt-1 text-slate-600">Admin asset table powered by `useGetClientAssetsQuery`.</p>
        </div>
      </div>

      {isLoading && <div className="p-6 text-center text-slate-600">Loading assets...</div>}
      {isError && <div className="p-6 text-center text-red-600">Error loading assets: {String(error)}</div>}

      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="divide-y divide-slate-100 md:hidden">
            {assets.map((item) => (
              <article key={item.id} className="space-y-4 bg-[linear-gradient(180deg,_rgba(255,255,255,1),_rgba(248,250,252,0.92))] p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={getClientAssetPreviewSrc(item.imageUrl)}
                    alt={`Client asset ${item.id}`}
                    className="h-20 w-20 shrink-0 rounded-2xl border border-slate-200 object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{getAssetFileName(item.imageUrl)}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{isZipAssetUrl(item.imageUrl) ? 'ZIP Asset' : 'Image Asset'}</p>
                    <p className="mt-3 text-sm text-slate-600">{new Date(item.createdAt).toLocaleString()}</p>
                    <span className="mt-3 inline-flex rounded-full bg-gradient-to-r from-sky-100 to-violet-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {getDaysSinceUpload(item.createdAt)} days ago
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      const copyUrl = getClientAssetShareUrl(window.location.origin, item.imageUrl);
                      navigator.clipboard.writeText(copyUrl).then(() => {
                        addToast('Link copied to clipboard', 'success');
                      }).catch(() => {
                        addToast('Failed to copy link. Please copy manually.', 'error');
                      });
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <HiOutlineClipboardDocument className="h-4 w-4" />
                    Copy Link
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-[linear-gradient(180deg,_#f8fbff,_#f1f5f9)]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">File Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Uploaded</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Age</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((item) => (
                  <tr key={item.id} className="transition hover:bg-sky-50/40">
                    <td className="px-6 py-4">
                      <img
                        src={getClientAssetPreviewSrc(item.imageUrl)}
                        alt={`Client asset ${item.id}`}
                        className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
                        loading="lazy"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-sm">
                        <p className="truncate text-sm font-semibold text-slate-900">{getAssetFileName(item.imageUrl)}</p>
                        <p className="mt-1 text-xs text-slate-500">{isZipAssetUrl(item.imageUrl) ? 'ZIP Asset' : 'Image Asset'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-gradient-to-r from-sky-100 to-violet-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {getDaysSinceUpload(item.createdAt)} days ago
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const copyUrl = getClientAssetShareUrl(window.location.origin, item.imageUrl);
                            navigator.clipboard.writeText(copyUrl).then(() => {
                              addToast('Link copied to clipboard', 'success');
                            }).catch(() => {
                              addToast('Failed to copy link. Please copy manually.', 'error');
                            });
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <HiOutlineClipboardDocument className="h-4 w-4" />
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={isDeleting}
                          className="inline-flex items-center rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {assets.length === 0 && <div className="p-6 text-center text-slate-600">No client assets found.</div>}
        </div>
      )}
    </div>
  );
}

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

  const handleDelete = async (id: string) => {
    try {
      await deleteClientAsset(id).unwrap();
      addToast('Client asset deleted successfully', 'success');
    } catch (deleteError) {
      console.error('Failed to delete asset:', deleteError);
      addToast('Failed to delete asset. Please try again.', 'error');
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">List Of Assets</h1>
          <p className="mt-1 text-slate-600">Admin asset table powered by `useGetClientAssetsQuery`.</p>
        </div>
      </div>

      {isLoading && <div className="p-6 text-center text-slate-600">Loading assets...</div>}
      {isError && <div className="p-6 text-center text-red-600">Error loading assets: {String(error)}</div>}

      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
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
                  <tr key={item.id} className="transition hover:bg-slate-50/80">
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
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {getDaysSinceUpload(item.createdAt)} days ago
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const copyUrl = getClientAssetShareUrl(window.location.origin, item.id, item.imageUrl);
                            navigator.clipboard.writeText(copyUrl).then(() => {
                              addToast('Link copied to clipboard', 'success');
                            }).catch(() => {
                              addToast('Failed to copy link. Please copy manually.', 'error');
                            });
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <HiOutlineClipboardDocument className="h-4 w-4" />
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={isDeleting}
                          className="inline-flex items-center rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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

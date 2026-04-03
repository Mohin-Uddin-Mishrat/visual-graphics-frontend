'use client';

import Link from 'next/link';
import { useGetClientAssetsQuery, useDeleteClientAssetMutation, type ClientAsset } from '@/redux';
import { getClientAssetPreviewSrc, getClientAssetShareUrl, isZipAssetUrl } from '@/lib/clientAssetFiles';
import { useToast } from '@/lib/toast';
import { useState } from 'react';
import { HiOutlineClipboardDocument } from 'react-icons/hi2';

function getDaysSinceUpload(createdAt: string): number {
  const uploadDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - uploadDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function ImageModal({ asset, onClose }: { asset: ClientAsset | null; onClose: () => void }) {
  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="relative max-h-[90vh] w-full max-w-4xl p-3 sm:p-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white transition-colors hover:text-gray-300 sm:-top-12 sm:right-0 sm:bg-transparent sm:p-0"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={getClientAssetPreviewSrc(asset.imageUrl)}
          alt={`Client asset ${asset.id}`}
          className="w-full h-full object-contain rounded-lg"
        />
        <div className="mt-4 bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600 mt-1">Uploaded: {new Date(asset.createdAt).toLocaleString()}</p>
          <p className="text-sm text-gray-600">{getDaysSinceUpload(asset.createdAt)} days ago</p>
         
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useGetClientAssetsQuery();
  const [deleteClientAsset, { isLoading: isDeleting }] = useDeleteClientAssetMutation();
  const { addToast } = useToast();
  const [selectedAsset, setSelectedAsset] = useState<ClientAsset | null>(null);

  const recent: ClientAsset[] = data ?? [];

  const handleDelete = async (id: string) => {
    try {
      await deleteClientAsset(id).unwrap();
      addToast('Client asset deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete asset:', error);
      addToast('Failed to delete asset. Please try again.', 'error');
    }
  };

  const handleCardClick = (asset: ClientAsset) => {
    setSelectedAsset(asset);
  };

  const closeModal = () => {
    setSelectedAsset(null);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Dashboard</h1>
        </div>
        <Link
          href="/upload"
          className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
        >
          Add Client Asset
        </Link>
      </div>

    

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Recent Client Assets</h2>

        {isLoading && <div className="p-6 text-center text-slate-600">Loading assets...</div>}
        {isError && <div className="p-6 text-center text-red-600">Error loading assets: {String(error)}</div>}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {recent.map((item) => (
              <article key={item.id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm group cursor-pointer">
                <img
                  src={getClientAssetPreviewSrc(item.imageUrl)}
                  alt={`Client asset ${item.id}`}
                  className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  onClick={() => handleCardClick(item)}
                />
                <div className="p-4">
                  {isZipAssetUrl(item.imageUrl) && (
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">ZIP Asset</p>
                  )}
                  <p className="text-sm text-slate-500">Uploaded: {new Date(item.createdAt).toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                      {getDaysSinceUpload(item.createdAt)} days ago
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const copyUrl = getClientAssetShareUrl(window.location.origin, item.id, item.imageUrl);
                          navigator.clipboard.writeText(copyUrl).then(() => {
                            addToast('Link copied to clipboard', 'success');
                          }).catch(() => {
                            addToast('Failed to copy link. Please copy manually.', 'error');
                          });
                        }}
                        className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                        title="Copy asset link"
                      >
                        <HiOutlineClipboardDocument className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
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
                </div>
              </article>
            ))}
            {recent.length === 0 && <div className="p-6 text-center text-slate-600">No recent assets found.</div>}
          </div>
        )}
      </section>

      

      <ImageModal asset={selectedAsset} onClose={closeModal} />
    </div>
  );
}

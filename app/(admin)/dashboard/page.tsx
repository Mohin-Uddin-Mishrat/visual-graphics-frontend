'use client';

import Link from 'next/link';
import { useGetClientAssetsQuery, useDeleteClientAssetMutation, type ClientAsset } from '@/lib/clientAssetsApi';
import { getClientAssetPreviewSrc, getClientAssetShareUrl, isZipAssetUrl } from '@/lib/clientAssetFiles';
import { useToast } from '@/lib/toast';
import { useState } from 'react';
import { HiOutlineClipboardDocument } from 'react-icons/hi2';

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

function ImageModal({ asset, onClose }: { asset: ClientAsset | null; onClose: () => void }) {
  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
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

  const total = data?.length ?? 0;
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Live client asset status from API</p>
        </div>
        <Link
          href="/upload"
          className="rounded-xl bg-indigo-600 px-5 py-3 text-white font-semibold hover:bg-indigo-700 transition"
        >
          Add Client Asset
        </Link>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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

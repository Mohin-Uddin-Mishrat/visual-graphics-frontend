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

  const handleDelete = async (id: number) => {
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
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,_rgba(37,99,235,0.14),_rgba(14,165,233,0.08)_42%,_rgba(168,85,247,0.14))] px-6 py-7 shadow-[0_24px_80px_rgba(59,130,246,0.12)] sm:px-8">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.85),_transparent_58%)]" />
        <div className="relative mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">Command View</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Monitor recent uploads, jump into fresh assets, and manage your visual pipeline from one colorful overview.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assets Live</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{recent.length}</p>
            </div>
            <Link
              href="/upload"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#2563eb,_#7c3aed)] px-5 py-3 font-semibold text-white shadow-[0_16px_30px_rgba(79,70,229,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_36px_rgba(79,70,229,0.36)] sm:w-auto"
            >
              Add Client Asset
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/70 bg-white/75 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Fast Access</p>
            <p className="mt-2 text-sm text-slate-600">Review the latest client submissions without leaving the main dashboard.</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/75 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Visual Flow</p>
            <p className="mt-2 text-sm text-slate-600">Color-coded cards keep uploads, actions, and asset types easier to scan.</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/75 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Quick Actions</p>
            <p className="mt-2 text-sm text-slate-600">Copy links and remove items directly from the asset cards in one tap.</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">Gallery Feed</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Recent Client Assets</h2>
          </div>
          <p className="text-sm text-slate-500">Newest uploads styled as quick-action cards.</p>
        </div>

        {isLoading && <div className="p-6 text-center text-slate-600">Loading assets...</div>}
        {isError && <div className="p-6 text-center text-red-600">Error loading assets: {String(error)}</div>}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {recent.map((item) => (
              <article key={item.id} className="group relative overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,1),_rgba(248,250,252,0.96))] shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(37,99,235,0.16)] cursor-pointer">
                <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_#2563eb,_#8b5cf6,_#14b8a6)]" />
                <img
                  src={getClientAssetPreviewSrc(item.imageUrl)}
                  alt={`Client asset ${item.id}`}
                  className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  onClick={() => handleCardClick(item)}
                />
                <div className="p-4">
                  {isZipAssetUrl(item.imageUrl) && (
                    <p className="mb-2 inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">ZIP Asset</p>
                  )}
                  <p className="text-sm text-slate-500">Uploaded: {new Date(item.createdAt).toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="rounded-full bg-gradient-to-r from-sky-100 to-indigo-100 px-3 py-1 text-xs font-medium text-slate-700">
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
                        className="rounded-xl bg-emerald-50 p-2 text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-800"
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
                        className="rounded-xl bg-rose-50 p-2 text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
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
            {recent.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600">No recent assets found.</div>}
          </div>
        )}
      </section>

      <ImageModal asset={selectedAsset} onClose={closeModal} />
    </div>
  );
}

'use client';

import { useGetClientAssetsQuery, useDeleteClientAssetMutation, useCreateClientAssetMutation, type ClientAsset } from '@/lib/clientAssetsApi';
import { useToast } from '@/lib/toast';
import { useState } from 'react';
import { HiOutlineClipboardDocument, HiOutlineTrash } from 'react-icons/hi2';

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
          src={asset.imageUrl}
          alt={`${asset.clientName} asset`}
          className="w-full h-full object-contain rounded-lg"
        />
        <div className="mt-4 bg-white rounded-lg p-4">
          <h3 className="text-xl font-semibold text-gray-900">{asset.clientName}</h3>
          <p className="text-sm text-gray-600 mt-1">Uploaded: {new Date(asset.createdAt).toLocaleString()}</p>
          <p className="text-sm text-gray-600">{getDaysSinceUpload(asset.createdAt)} days ago</p>
         
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useGetClientAssetsQuery();
  const [createClientAsset, { isLoading: isCreating }] = useCreateClientAssetMutation();
  const [deleteClientAsset, { isLoading: isDeleting }] = useDeleteClientAssetMutation();
  const { addToast } = useToast();
  const [selectedAsset, setSelectedAsset] = useState<ClientAsset | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [file, setFile] = useState<File | null>(null);

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

  const openFormModal = () => {
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setClientName('');
    setFile(null);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!clientName.trim() || !file) {
      addToast('Client name and file are required.', 'error');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('clientName', clientName);
      payload.append('isClientSent', 'false');
      payload.append('file', file);

      await createClientAsset(payload).unwrap();
      addToast('Client asset created successfully', 'success');
      closeFormModal();
    } catch (error) {
      console.error('Failed to create asset:', error);
      addToast('Failed to create asset. Please try again.', 'error');
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Live client asset status from API</p>
        </div>
        <button
          onClick={openFormModal}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-white font-semibold hover:bg-indigo-700 transition"
        >
          Add Client Asset
        </button>
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
                  src={item.imageUrl}
                  alt={`${item.clientName} asset`}
                  className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  onClick={() => handleCardClick(item)}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900">{item.clientName}</h3>
                  <p className="text-sm text-slate-500 mt-1">Uploaded: {new Date(item.createdAt).toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                      {getDaysSinceUpload(item.createdAt)} days ago
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const copyUrl = `${window.location.origin}/image/${item.id}`;
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

      <section className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-3xl border border-indigo-100 p-6 shadow-inner">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Overview</h2>
        <p className="text-slate-600 leading-relaxed">
          This dashboard is connected to <code className="rounded bg-slate-100 px-1 py-px">{process.env.NEXT_PUBLIC_API_BASE_URL}</code> and shows live client assets.
          Keep an eye on freshness, capacity, and feedback loops for improved upload handling.
        </p>
      </section>

      <ImageModal asset={selectedAsset} onClose={closeModal} />

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeFormModal}>
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Upload New Client Asset</h3>
              <button onClick={closeFormModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client Name</label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Is Client Sent</label>
                <input
                  type="text"
                  value="false"
                  disabled
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 p-2 text-gray-600"
                />
                <input type="hidden" name="isClientSent" value="false" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">File</label>
                <label className="mt-1 block cursor-pointer rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-6 text-center hover:border-blue-400 hover:bg-blue-100">
                  <span className="text-sm text-blue-700">Drag files here or <span className="font-semibold text-blue-900">choose from folder</span></span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="mt-2 hidden"
                    required
                  />
                </label>
                {file && <div className="mt-2 text-xs text-slate-700">Selected file: {file.name}</div>}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeFormModal} className="rounded-lg border border-gray-300 px-4 py-2">Cancel</button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isCreating ? 'Uploading...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

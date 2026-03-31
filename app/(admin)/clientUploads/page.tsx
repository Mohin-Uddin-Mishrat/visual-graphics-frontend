'use client';

import { useGetClientAssetsSentQuery, useDeleteClientAssetMutation, useDownloadClientAssetMutation, type ClientAsset } from '@/lib/clientAssetsApi';
import { useToast } from '@/lib/toast';
import { HiOutlineCloudArrowDown, HiOutlineTrash } from 'react-icons/hi2';

function getDaysSinceUpload(createdAt: string): number {
  const uploadDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - uploadDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function ClientUploadCard({ asset, onDelete, onDownload, isDeleting, isDownloading }: {
  asset: ClientAsset;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  isDeleting: boolean;
  isDownloading: boolean;
}) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 group">
      <img
        src={asset.imageUrl}
        alt={`Client asset ${asset.id}`}
        className="h-48 w-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />
      <div className="p-5">
        <p className="text-sm text-slate-600 mb-2">Uploaded: {new Date(asset.createdAt).toLocaleString()}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {getDaysSinceUpload(asset.createdAt)} days ago
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onDownload(asset.id)}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              title="Download asset"
            >
              <HiOutlineCloudArrowDown className="w-4 h-4" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
            <button
              onClick={() => onDelete(asset.id)}
              disabled={isDeleting}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              title="Delete asset"
            >
              <HiOutlineTrash className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ClientUploadsPage() {
  const { data, isLoading, isError, error } = useGetClientAssetsSentQuery();
  const [deleteClientAsset, { isLoading: isDeleting }] = useDeleteClientAssetMutation();
  const [downloadClientAsset, { isLoading: isDownloading }] = useDownloadClientAssetMutation();
  const { addToast } = useToast();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client asset?')) {
      try {
        await deleteClientAsset(id).unwrap();
        addToast('Client asset deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete asset:', error);
        addToast('Failed to delete asset. Please try again.', 'error');
      }
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const blob = await downloadClientAsset(id).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `client-asset-${id}.webp`; // Assuming webp format based on sample data
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast('Asset downloaded successfully', 'success');
    } catch (error) {
      console.error('Failed to download asset:', error);
      addToast('Failed to download asset. Please try again.', 'error');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Client Uploads</h1>
          <p className="text-slate-600">Showing only assets where isClientSent=true</p>
        </div>
      </div>

      {isLoading && <div className="p-6 text-center text-slate-600">Loading client uploads...</div>}
      {isError && <div className="p-6 text-center text-red-600">Error loading uploads: {String(error)}</div>}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {data && data.length > 0 ? (
            data.map((asset) => (
              <ClientUploadCard
                key={asset.id}
                asset={asset}
                onDelete={handleDelete}
                onDownload={handleDownload}
                isDeleting={isDeleting}
                isDownloading={isDownloading}
              />
            ))
          ) : (
            <div className="col-span-full p-6 text-center text-slate-600">No uploads found.</div>
          )}
        </div>
      )}
    </div>
  );
}

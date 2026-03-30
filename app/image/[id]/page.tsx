'use client';

import { useParams } from 'next/navigation';
import { useGetClientAssetByIdQuery, useDownloadClientAssetMutation } from '@/lib/clientAssetsApi';
import { useToast } from '@/lib/toast';

export default function ImagePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: asset, isLoading, isError } = useGetClientAssetByIdQuery(id, { skip: !id });
  const [downloadClientAsset, { isLoading: isDownloading }] = useDownloadClientAssetMutation();
  const { addToast } = useToast();

  const handleDownload = async () => {
    if (!id) return;
    try {
      const blob = await downloadClientAsset(id).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${id}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast('Asset downloaded successfully', 'success');
    } catch (error) {
      console.error('Download failed', error);
      addToast('Failed to download asset.', 'error');
    }
  };

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Invalid Image ID</h1>
          <p className="text-gray-600">No ID provided.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center text-gray-600">Loading asset...</div>
      </div>
    );
  }

  if (isError || !asset) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Asset not found</h1>
          <p className="text-gray-600">Unable to retrieve client asset for ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-white flex flex-col items-center justify-center  p-4">
      <img
        src={asset.imageUrl}
        alt={asset.clientName}
        className="w-4/5 max-w-5xl object-contain pt-20 rounded-lg shadow-2xl"
      />
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? 'Downloading...' : 'Download'}
        </button>
     
      </div>
    </div>
  );
}

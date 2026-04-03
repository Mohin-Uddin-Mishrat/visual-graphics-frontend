'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetClientAssetByIdQuery, useDownloadClientAssetMutation } from '@/redux';
import {
  getAssetFileName,
  getClientAssetDownloadName,
  getClientAssetPreviewSrc,
  isZipAssetUrl,
} from '@/lib/clientAssetFiles';
import { useToast } from '@/lib/toast';
import { useState } from 'react';

function getFileExtension(fileName: string) {
  const value = fileName.split('.').pop()?.toUpperCase();
  return value || 'FILE';
}

export default function ImagePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const idParam = params.id as string | undefined;
  const assetId = idParam ? Number(idParam) : Number.NaN;
  const isValidAssetId = Number.isInteger(assetId) && assetId > 0;
  const { data: asset, isLoading, isError } = useGetClientAssetByIdQuery(assetId, { skip: !isValidAssetId });
  const [downloadClientAsset, { isLoading: isDownloading }] = useDownloadClientAssetMutation();
  const { addToast } = useToast();
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const handleDownload = async () => {
    if (!isValidAssetId) return;
    try {
      const blob = await downloadClientAsset(assetId).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getClientAssetDownloadName(assetId, blob, 'asset');
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

  const fileName = searchParams.get('file') || (asset ? getAssetFileName(asset.imageUrl) : `asset-${assetId}`);
  const isZip = asset ? isZipAssetUrl(asset.imageUrl) : fileName.toLowerCase().endsWith('.zip');
  const previewSrc = asset ? getClientAssetPreviewSrc(asset.imageUrl) : '';
  const formatLabel = isZip ? 'ZIP' : getFileExtension(fileName);

  if (!isValidAssetId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111111] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Invalid Image ID</h1>
          <p className="text-sm text-slate-400">No valid numeric ID provided.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111111]">
        <div className="text-center text-sm text-slate-400">Loading asset...</div>
      </div>
    );
  }

  if (isError || !asset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111111] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Asset not found</h1>
          <p className="text-sm text-slate-400">Unable to retrieve client asset for ID: {assetId}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#161312] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <section className="flex min-h-[70vh] flex-1 flex-col">
          <div className="flex items-center justify-between px-5 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/8"
                aria-label="Back to dashboard"
              >
                <span aria-hidden="true" className="text-sm font-semibold uppercase tracking-[0.18em]">Back</span>
              </Link>
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-white">{fileName}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Asset Viewer</p>
              </div>
            </div>
            <div className="hidden text-sm text-slate-500 sm:block">File 1 of 1</div>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 pb-6 pt-2 sm:px-8 sm:pb-10">
            <div className="flex h-full w-full max-w-6xl items-center justify-center rounded-[2rem] border border-white/6 bg-[#14100f] p-4 shadow-[0_35px_100px_rgba(0,0,0,0.45)] sm:p-8">
              <img
                src={previewSrc}
                alt={fileName}
                className={[
                  'max-h-[78vh] w-full rounded-[1.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.42)]',
                  isZip ? 'object-contain bg-[#181413] p-8' : 'object-contain',
                ].join(' ')}
                onLoad={(event) => {
                  const target = event.currentTarget;
                  setDimensions({
                    width: target.naturalWidth,
                    height: target.naturalHeight,
                  });
                }}
              />
            </div>
          </div>
        </section>

        <aside className="w-full border-t border-white/6 bg-[#171311] px-5 py-6 lg:w-[320px] lg:border-l lg:border-t-0 lg:px-7">
          <div className="space-y-8">
            <div>
              <p className="text-sm font-medium text-slate-500">Preview Details</p>
              <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Format</span>
                  <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-100">
                    {formatLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Dimension</span>
                  <span className="text-sm font-medium text-slate-200">
                    {isZip ? '--' : dimensions ? `${dimensions.width} x ${dimensions.height}` : '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Uploaded</span>
                  <span className="text-right text-sm font-medium text-slate-200">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Source</span>
                  <span className="text-sm font-medium text-slate-200">{asset.isClientSent ? 'Client' : 'Admin'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDownloading ? 'Downloading...' : 'Download'}
              </button>
              <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-xs leading-5 text-slate-400">
                ID: <span className="break-all text-slate-300">{asset.id}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

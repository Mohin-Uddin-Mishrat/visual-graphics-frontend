'use client';

import { useId, useState } from 'react';
import { HiOutlineArrowUpTray, HiOutlineDocument } from 'react-icons/hi2';
import { useCreateClientAssetMutation } from '@/redux';
import { CLIENT_ASSET_ACCEPT, getClientAssetShareUrl } from '@/lib/clientAssetFiles';
import { useToast } from '@/lib/toast';

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(value >= 100 || unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

export default function ImageUploadPage() {
  const inputId = useId();
  const [createClientAsset, { isLoading }] = useCreateClientAssetMutation();
  const { addToast, updateToast, removeToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleFileChange = (nextFile: File | null) => {
    setFile(nextFile);
    setUploadProgress(0);
    setIsUploaded(false);
    setCopied(false);
    setCopiedUrl(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      addToast('Please select a file before uploading.', 'error');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('isClientSent', 'true');
      payload.append('file', file);

      setUploadProgress(0);
      setIsUploaded(false);

      const toastId = addToast('Uploading client asset...', 'info', { progress: 0, persistent: true });

      const response = await createClientAsset({
        formData: payload,
        onUploadProgress: (progress) => {
          setUploadProgress(progress);
          updateToast(toastId, {
            message: progress >= 100 ? 'Finishing upload...' : 'Uploading client asset...',
            type: 'info',
            progress,
          });
        },
      }).unwrap();

      setUploadProgress(100);
      setIsUploaded(true);
      setCopied(false);
      setCopiedUrl(getClientAssetShareUrl(window.location.origin, response.data.id, response.data.imageUrl));
      updateToast(toastId, {
        message: 'Client asset uploaded successfully.',
        type: 'success',
        progress: 100,
      });
      setTimeout(() => removeToast(toastId), 2000);
    } catch (error) {
      console.error('Failed to upload client asset:', error);
      const toastId = addToast('Upload failed. Please try again.', 'error', { progress: 100, persistent: true });
      setTimeout(() => removeToast(toastId), 4000);
    }
  };

  const handleCopyUrl = async () => {
    if (!copiedUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(copiedUrl);
      setCopied(true);
    } catch (error) {
      console.error('Failed to copy uploaded asset URL:', error);
      addToast('Failed to copy URL. Please try again.', 'error');
    }
  };

  const showProgressCard = Boolean(file);
  const selectedFile = file;

  return (
    <main className="min-h-full bg-[#f1f3f7] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600">Client Upload</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Upload Client Asset</h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Send files into the client asset pipeline with <code>isClientSent=true</code>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <label
            htmlFor={inputId}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragActive(false);
              handleFileChange(event.dataTransfer.files?.[0] ?? null);
            }}
            className={[
              'block cursor-pointer rounded-[2rem] border border-dashed bg-white px-6 py-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition sm:px-10 sm:py-16',
              isDragActive ? 'border-violet-400 ring-4 ring-violet-100' : 'border-slate-200 hover:border-violet-300 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]',
            ].join(' ')}
          >
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
              <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-violet-100 text-violet-600 sm:h-20 sm:w-20">
                <HiOutlineArrowUpTray className="h-10 w-10" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Drag &amp; Drop Files Here</h2>
                <p className="text-2xl text-slate-500">or</p>
              </div>
              <span className="inline-flex min-w-44 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#5b4cf3_0%,_#6c63ff_100%)] px-8 py-4 text-lg font-semibold text-white shadow-[0_18px_35px_rgba(91,76,243,0.28)] transition hover:translate-y-[-1px]">
                Select Files
              </span>
              <p className="text-sm text-slate-500">
                ZIP files and images are accepted. The upload will be marked as client-originated automatically.
              </p>
            </div>

            <input
              id={inputId}
              type="file"
              accept={CLIENT_ASSET_ACCEPT}
              className="hidden"
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
            />
          </label>

          {showProgressCard && selectedFile && (
            <section className="rounded-[1.5rem] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <HiOutlineDocument className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words text-lg font-medium text-slate-900">{selectedFile.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {isUploaded ? 'Upload completed successfully.' : isLoading ? 'Uploading to asset storage...' : 'Ready to upload.'}
                      </p>
                    </div>
                    <div className="text-right text-sm font-medium text-slate-500">
                      {formatFileSize(selectedFile.size)}
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="h-6 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="flex h-full items-center justify-center rounded-full bg-[linear-gradient(90deg,_#5445ef_0%,_#6d6af9_100%)] text-xs font-semibold text-slate-900 transition-[width] duration-300"
                        style={{ width: `${Math.max(uploadProgress, isUploaded ? 100 : 0)}%` }}
                      >
                        {(uploadProgress > 0 || isUploaded) ? `${Math.max(uploadProgress, isUploaded ? 100 : 0)}%` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              {copiedUrl ? copiedUrl : file ? 'Selected file is ready for client upload.' : 'Choose one file to begin.'}
            </div>
            {copiedUrl ? (
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#5b4cf3_0%,_#6c63ff_100%)] px-6 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
              >
                {copied ? 'Copied URL' : 'Copy URL'}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !file}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isLoading ? 'Uploading...' : isUploaded ? 'Uploaded' : 'Upload File'}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useCreateClientAssetMutation } from '@/lib/clientAssetsApi';
import { CLIENT_ASSET_ACCEPT, isImageFile } from '@/lib/clientAssetFiles';
import { useToast } from '@/lib/toast';

export default function ImageUploadPage() {
  const [createClientAsset, { isLoading }] = useCreateClientAssetMutation();
  const { addToast, updateToast, removeToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (nextFile: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(nextFile);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      addToast('Please choose a ZIP or image file first.', 'error');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('isClientSent', 'true');
      payload.append('file', file);

      const toastId = addToast('Uploading file...', 'info', { progress: 0, persistent: true });

      await createClientAsset({
        formData: payload,
        onUploadProgress: (progress) => {
          updateToast(toastId, {
            message: progress >= 100 ? 'Finishing upload...' : 'Uploading file...',
            type: 'info',
            progress,
          });
        },
      }).unwrap();

      updateToast(toastId, {
        message: 'File uploaded successfully.',
        type: 'success',
        progress: 100,
      });
      setTimeout(() => removeToast(toastId), 2000);
      handleFileChange(null);
    } catch (error) {
      console.error('Failed to upload file:', error);
      const toastId = addToast('Upload failed. Please try again.', 'error', { progress: 100, persistent: true });
      setTimeout(() => removeToast(toastId), 4000);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#eef6fb_0%,_#f8fbff_50%,_#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur">
          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,_#f4fbff_0%,_#edf4ff_100%)] px-6 py-8 text-center sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">Visual Graphics</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Client Image Upload
            </h1>
          
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
              <label
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
                  'group flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed px-6 py-8 text-center transition sm:min-h-[360px] lg:min-h-[420px]',
                  isDragActive
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-slate-300 bg-[linear-gradient(180deg,_#eef6ff_0%,_#dbeafe_100%)] hover:border-cyan-400 hover:bg-[linear-gradient(180deg,_#f3fbff_0%,_#dcecff_100%)]',
                ].join(' ')}
              >
                {previewUrl && isImageFile(file) ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                    <img
                      src={previewUrl}
                      alt="Selected preview"
                      className="max-h-[360px] w-full rounded-[1.25rem] object-contain shadow-[0_20px_50px_rgba(59,130,246,0.16)]"
                    />
                    <div className="rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                      {file?.name}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                      <span aria-hidden="true">{file ? 'ZIP' : '+'}</span>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-900 sm:text-2xl">Drop client file here</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                        Or click to browse from your device. ZIP, JPG, PNG, WEBP, GIF and other image files are supported.
                      </p>
                      {file && (
                        <div className="mt-4 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                          {file.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept={CLIENT_ASSET_ACCEPT}
                  className="hidden"
                  onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-600">
                  {file ? `Ready to upload: ${file.name}` : 'No client file selected yet.'}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(90deg,_#3b82f6_0%,_#0ea5e9_100%)] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_30px_rgba(59,130,246,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_36px_rgba(59,130,246,0.34)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Uploading...' : 'Execute'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { clearAuth } from '@/redux/authSlice';
import type { RootState } from '@/redux/store';
import { api } from './baseApi';

export type ClientAsset = {
  id: number;
  imageUrl: string;
  createdAt: string;
  isClientSent: boolean;
};

type ClientAssetsResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: ClientAsset[];
};

type CreateClientAssetArgs = {
  formData: FormData;
  onUploadProgress?: (progress: number) => void;
};

type CreateClientAssetResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: ClientAsset;
};

export const clientAssetsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getClientAssets: builder.query<ClientAsset[], void>({
      query: () => '/api/v1/cloude-flare/client-assets?isClientSent=false',
      transformResponse: (response: ClientAssetsResponse) => response.data || [],
      providesTags: ['ClientAssets'],
    }),
    getClientAssetsSent: builder.query<ClientAsset[], void>({
      query: () => '/api/v1/cloude-flare/client-assets?isClientSent=true',
      transformResponse: (response: ClientAssetsResponse) => response.data || [],
      providesTags: ['ClientAssets'],
    }),
    createClientAsset: builder.mutation<CreateClientAssetResponse, CreateClientAssetArgs>({
      queryFn: async ({ formData, onUploadProgress }, apiContext) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://visual-graphics.onrender.com';
        const url = `${baseUrl}/api/v1/cloude-flare/client-assets`;

        return await new Promise<{ data: CreateClientAssetResponse } | { error: FetchBaseQueryError }>((resolve) => {
          const xhr = new XMLHttpRequest();

          xhr.open('POST', url);
          xhr.withCredentials = true;

          const token = (apiContext.getState() as RootState).auth.accessToken;
          const isAuthenticatedUpload = formData.get('isClientSent') === 'false';

          if (token && isAuthenticatedUpload) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }

          xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) {
              return;
            }

            onUploadProgress?.(Math.min(99, Math.round((event.loaded / event.total) * 100)));
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              onUploadProgress?.(100);
              try {
                resolve({ data: JSON.parse(xhr.responseText) as CreateClientAssetResponse });
              } catch {
                resolve({
                  error: {
                    status: 'PARSING_ERROR',
                    originalStatus: xhr.status,
                    data: xhr.responseText || 'Invalid upload response',
                    error: 'Failed to parse upload response',
                  },
                });
              }
              return;
            }

            if (xhr.status === 401) {
              apiContext.dispatch(clearAuth());
            }

            resolve({
              error: {
                status: xhr.status,
                data: xhr.responseText || 'Upload failed',
              },
            });
          };

          xhr.onerror = () => {
            resolve({
              error: {
                status: 'FETCH_ERROR',
                error: 'Network error while uploading file',
              },
            });
          };

          xhr.send(formData);
        });
      },
      invalidatesTags: ['ClientAssets'],
    }),
    deleteClientAsset: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/v1/cloude-flare/client-assets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ClientAssets'],
    }),
    getClientAssetById: builder.query<ClientAsset, string>({
      queryFn: async (filename) => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://visual-graphics.onrender.com';
          const response = await fetch(`${baseUrl}/api/v1/cloude-flare/client-assets/${encodeURIComponent(filename)}`, {
            method: 'GET',
            credentials: 'omit',
            cache: 'no-store',
          });

          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data: await response.text(),
              } as FetchBaseQueryError,
            };
          }

          const payload = (await response.json()) as {
            statusCode: number;
            success: boolean;
            message: string;
            data: ClientAsset;
          };

          return { data: payload.data };
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR',
              error: error instanceof Error ? error.message : 'Failed to fetch asset',
            },
          };
        }
      },
      providesTags: ['ClientAssets'],
    }),
    downloadClientAsset: builder.mutation<Blob, number>({
      query: (id) => ({
        url: `/api/v1/cloude-flare/client-assets/${id}/download`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetClientAssetsQuery,
  useGetClientAssetsSentQuery,
  useCreateClientAssetMutation,
  useDeleteClientAssetMutation,
  useGetClientAssetByIdQuery,
  useDownloadClientAssetMutation,
} = clientAssetsApi;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type ClientAsset = {
  id: string;
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
  success: true;
};

export const clientAssetsApi = createApi({
  reducerPath: 'clientAssetsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://visual-graphics.onrender.com',
  }),
  tagTypes: ['ClientAssets'],
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
      queryFn: async ({ formData, onUploadProgress }) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://visual-graphics.onrender.com';
        const url = `${baseUrl}/api/v1/cloude-flare/client-assets`;

        return await new Promise((resolve) => {
          const xhr = new XMLHttpRequest();

          xhr.open('POST', url);

          xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) {
              return;
            }

            onUploadProgress?.(Math.min(99, Math.round((event.loaded / event.total) * 100)));
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              onUploadProgress?.(100);
              resolve({ data: { success: true } });
              return;
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
    deleteClientAsset: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/cloude-flare/client-assets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ClientAssets'],
    }),
    getClientAssetById: builder.query<ClientAsset, string>({
      query: (id) => `/api/v1/cloude-flare/client-assets/${id}`,
      transformResponse: (response: { statusCode: number; success: boolean; message: string; data: ClientAsset }) => response.data,
      providesTags: ['ClientAssets'],
    }),
    downloadClientAsset: builder.mutation<Blob, string>({
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

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type ClientAsset = {
  id: string;
  clientName: string;
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
    createClientAsset: builder.mutation<void, FormData>({
      query: (body) => ({
        url: '/api/v1/cloude-flare/client-assets',
        method: 'POST',
        body,
      }),
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

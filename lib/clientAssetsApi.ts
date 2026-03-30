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
  endpoints: (builder) => ({
    getClientAssets: builder.query<ClientAsset[], void>({
      query: () => '/api/v1/cloude-flare/client-assets?isClientSent=false',
      transformResponse: (response: ClientAssetsResponse) => response.data || [],
      providesTags: ['ClientAssets'],
    }),
    deleteClientAsset: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/cloude-flare/client-assets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ClientAssets'],
    }),
  }),
});

export const { useGetClientAssetsQuery, useDeleteClientAssetMutation } = clientAssetsApi;

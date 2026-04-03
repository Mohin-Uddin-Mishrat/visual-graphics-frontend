import {
  fetchBaseQuery,
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/redux/store';
import { clearAuth } from '@/redux/authSlice';

const AUTHENTICATED_ENDPOINTS = new Set([
  'logout',
  'getClientAssets',
  'getClientAssetsSent',
  'deleteClientAsset',
  'downloadClientAsset',
  'createUser',
  'getUsers',
  'updateUserRole',
  'updateUserPassword',
  'deleteUser',
]);

const publicBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://visual-graphics.onrender.com',
});

const authenticatedBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://visual-graphics.onrender.com',
  credentials: 'include',
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = (getState() as RootState).auth.accessToken;

    if (token && AUTHENTICATED_ENDPOINTS.has(endpoint)) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithAuthHandling: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const shouldAuthenticate = AUTHENTICATED_ENDPOINTS.has(api.endpoint);
  const result = shouldAuthenticate
    ? await authenticatedBaseQuery(args, api, extraOptions)
    : await publicBaseQuery(args, api, extraOptions);

  if (shouldAuthenticate && result.error?.status === 401) {
    api.dispatch(clearAuth());
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: ['Auth', 'ClientAssets', 'Users'],
  endpoints: () => ({}),
});

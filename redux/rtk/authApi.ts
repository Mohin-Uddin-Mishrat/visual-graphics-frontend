import { clearAuth, setCredentials, type AuthUser } from '@/redux/authSlice';
import type { RootState } from '@/redux/store';
import { api } from './baseApi';

type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
};

type LoginRequest = {
  email: string;
  password: string;
};

type LoginPayload = {
  accessToken: string;
  user: AuthUser;
};

type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
};

type CreatedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type UpdateUserRequest = {
  id: string;
};

type UpdateOwnProfileRequest = UpdateUserRequest & {
  name: string;
  email: string;
};

type UpdateUserRoleRequest = {
  id: string;
  role: 'ADMIN' | 'USER';
};

type UpdateUserPasswordRequest = {
  id: string;
  newPassword: string;
};

type ChangeOwnPasswordRequest = {
  id: string;
  oldPassword: string;
  newPassword: string;
};

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginPayload>, LoginRequest>({
      query: (body) => ({
        url: '/api/v1/auth/login',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              accessToken: data.data.accessToken,
              user: data.data.user,
            })
          );
        } catch {
          dispatch(clearAuth());
        }
      },
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/api/v1/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        dispatch(clearAuth());

        try {
          await queryFulfilled;
        } catch {
          dispatch(clearAuth());
        }
      },
      invalidatesTags: ['ClientAssets'],
    }),
    createUser: builder.mutation<ApiResponse<CreatedUser>, CreateUserRequest>({
      query: (body) => ({
        url: '/api/v1/auth/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    getUsers: builder.query<ApiResponse<CreatedUser[]>, void>({
      query: () => ({
        url: '/api/v1/auth/users',
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),
    updateOwnProfile: builder.mutation<ApiResponse<CreatedUser>, UpdateOwnProfileRequest>({
      query: ({ id, name, email }) => ({
        url: `/api/v1/auth/users/${id}`,
        method: 'PATCH',
        body: { name, email },
      }),
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const currentAuth = (getState() as RootState).auth;

          dispatch(
            setCredentials({
              accessToken: currentAuth.accessToken,
              user: data.data,
            })
          );
        } catch {
          // Keep the current auth state if the profile update fails.
        }
      },
      invalidatesTags: ['Users', 'Auth'],
    }),
    updateUserRole: builder.mutation<ApiResponse<CreatedUser>, UpdateUserRoleRequest>({
      query: ({ id, role }) => ({
        url: `/api/v1/auth/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['Users'],
    }),
    changeOwnPassword: builder.mutation<ApiResponse<CreatedUser>, ChangeOwnPasswordRequest>({
      query: ({ id, oldPassword, newPassword }) => ({
        url: `/api/v1/auth/users/${id}/password`,
        method: 'PATCH',
        body: { oldPassword, newPassword },
      }),
    }),
    updateUserPassword: builder.mutation<ApiResponse<CreatedUser>, UpdateUserPasswordRequest>({
      query: ({ id, newPassword }) => ({
        url: `/api/v1/auth/users/${id}/password`,
        method: 'PATCH',
        body: { newPassword },
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/api/v1/auth/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useCreateUserMutation,
  useGetUsersQuery,
  useUpdateOwnProfileMutation,
  useUpdateUserRoleMutation,
  useChangeOwnPasswordMutation,
  useUpdateUserPasswordMutation,
  useDeleteUserMutation,
} = authApi;

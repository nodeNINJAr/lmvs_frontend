/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './index';
import { logout } from './authSlice';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

// Auto-logout on 401
const baseQuery: typeof rawBaseQuery = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);
  if (result.error && result.error.status === 401) api.dispatch(logout());
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Me', 'Documents', 'Workers', 'Stats', 'Verification'],
  endpoints: (b) => ({
    // ── Auth ──
    register: b.mutation<any, FormData>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: b.mutation<any, { phone: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    me: b.query<any, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),

    // ── Documents ──
    uploadDocuments: b.mutation<any, FormData>({
      query: (body) => ({ url: '/documents/upload', method: 'POST', body }),
      invalidatesTags: ['Documents'],
    }),
    myDocuments: b.query<any, void>({
      query: () => '/documents/me',
      providesTags: ['Documents'],
    }),
    deleteDocument: b.mutation<any, string>({
      query: (id) => ({ url: `/documents/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Documents'],
    }),

    // ── Verification ──
    runVerification: b.mutation<any, string | void>({
      query: (workerId) => ({ url: '/verification/run', method: 'POST', body: workerId ? { workerId } : undefined }),
      invalidatesTags: ['Me', 'Documents', 'Workers', 'Stats', 'Verification'],
    }),
    myVerification: b.query<any, void>({
      query: () => '/verification/me',
      providesTags: ['Verification'],
    }),
    workerChat: b.mutation<{ reply: string }, { message: string; history?: { role: 'user' | 'assistant'; content: string }[] }>({
      query: (body) => ({ url: '/chat/me', method: 'POST', body }),
    }),

    // ── Admin ──
    listWorkers: b.query<any, void>({
      query: () => '/admin/workers',
      providesTags: ['Workers'],
    }),
    getWorker: b.query<any, string>({
      query: (id) => `/admin/workers/${id}`,
      providesTags: ['Workers'],
    }),
    decideWorker: b.mutation<any, { id: string; decision: 'APPROVED' | 'REJECTED'; reason?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/workers/${id}/decision`, method: 'POST', body }),
      invalidatesTags: ['Workers', 'Stats'],
    }),
    stats: b.query<any, void>({
      query: () => '/admin/stats',
      providesTags: ['Stats'],
    }),
    getDocument: b.query<any, string>({
      query: (id) => `/admin/documents/${id}`,
      providesTags: ['Documents'],
    }),
    adminChat: b.mutation<{ reply: string }, { message: string; history?: { role: 'user' | 'assistant'; content: string }[] }>({
      query: (body) => ({ url: '/admin/chat', method: 'POST', body }),
    }),

    // ── Public verify ──
    verifyByToken: b.query<any, string>({
      query: (token) => `/verify/${token}`,
    }),
    publicStats: b.query<any, void>({
      query: () => '/public/stats',
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useMeQuery,
  useUploadDocumentsMutation,
  useMyDocumentsQuery,
  useDeleteDocumentMutation,
  useRunVerificationMutation,
  useMyVerificationQuery,
  useWorkerChatMutation,
  useListWorkersQuery,
  useGetWorkerQuery,
  useDecideWorkerMutation,
  useStatsQuery,
  useGetDocumentQuery,
  useAdminChatMutation,
  useVerifyByTokenQuery,
  usePublicStatsQuery,
} = api;
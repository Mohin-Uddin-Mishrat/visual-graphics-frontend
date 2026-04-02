import { configureStore } from '@reduxjs/toolkit';
import { clientAssetsApi } from './rtk';

export const store = configureStore({
  reducer: {
    [clientAssetsApi.reducerPath]: clientAssetsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(clientAssetsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

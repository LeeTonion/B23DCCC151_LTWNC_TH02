import { configureStore } from '@reduxjs/toolkit';
import assignmentsReducer from '@/features/assignments/assignmentsSlice';
import { createLogger } from 'redux-logger';

const logger = createLogger({
  collapsed: true,
  duration: true,
  timestamp: true,
});

export const store = configureStore({
  reducer: {
    assignments: assignmentsReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: false,
    });
    if (process.env.NODE_ENV === 'development') {
      middleware.push(logger);
    }
    return middleware;
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
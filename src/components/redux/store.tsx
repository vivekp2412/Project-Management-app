import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./feature/userSlice";
import projectReducer from "./feature/projectSlice";
const store = configureStore({
  reducer: {
    user: userReducer,
    project: projectReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  auth,
  updateUserDatabase,
  getUserFromDatabase,
} from "../../../helpers/db";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { RootState } from "../store";
import { DocumentData } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { UserValues } from "../../../Types/types";

const initialValues: UserValues = {
  name: "",
  email: "",
  password: "",
  profileImage: "",
  designation: "",
  github: "",
  linkedin: "",
  uid: "",
};

const initialState = {
  userDetails: initialValues,
  authenticate: false,
  loading: false,
  error: null,
};

const storeTokenInLocalStorage = (expires: number) => {
  localStorage.setItem("expirationTime", JSON.stringify(expires));
};

// Thunk action to Signup user
export const signUpUser = createAsyncThunk(
  "user/signUpUser",
  async (values: UserValues, { rejectWithValue }) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        values.email!,
        values.password!
      );
      const userId = response.user.uid;

      await updateUserDatabase(
        { name: values.name, email: values.email },
        userId
      );

      const expires = new Date().getTime() + 24 * 60 * 60 * 1000;
      storeTokenInLocalStorage(expires);

      toast.success("Your registration was successful!", {
        position: "top-right",
        autoClose: 2000,
      });

      return { name: values.name, email: values.email, uid: userId };
    } catch (error: any) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/email-already-in-use") {
          toast.error("This email is already registered");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error(error.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Thunk action to login user
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (values: UserValues, { rejectWithValue }) => {
    try {
      await signInWithEmailAndPassword(auth, values.email!, values.password!);

      const expires = new Date().getTime() + 24 * 60 * 60 * 1000;
      storeTokenInLocalStorage(expires);

      toast.success("Logged in successfully", {
        position: "top-right",
        autoClose: 2000,
      });

      return { email: values.email };
    } catch (error: any) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/user-not-found") {
          toast.error("User not Found");
        } else if (error.code === "auth/wrong-password") {
          toast.error("Wrong Password");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error(error.message);
      }

      return rejectWithValue(error.message);
    }
  }
);

// Thunk action to fetch user details from the database
export const fetchUserDetails = createAsyncThunk(
  "user/fetchUserDetails",
  async (uid: string, { rejectWithValue }) => {
    try {
      const userDetails = await getUserFromDatabase(uid);

      return userDetails;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk action to update user details in the database
export const updateUserDetails = createAsyncThunk(
  "user/updateUserDetails",
  async (
    { user, uid }: { user: UserValues; uid: string },
    { rejectWithValue }
  ) => {
    try {
      await updateUserDatabase(user, uid);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("userToken");
      state.userDetails = initialValues;
      state.authenticate = false;
    },
    resetUser: (state) => {
      state.userDetails = initialValues;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state) => {
        state.error = null;
      })
      .addCase(
        signUpUser.fulfilled,
        (state, action: PayloadAction<UserValues>) => {
          state.userDetails = action.payload;
          state.authenticate = true;
          state.loading = false;
          state.error = null;
        }
      )
      .addCase(signUpUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ email?: string }>) => {
          state.userDetails = action.payload;
          state.authenticate = true;
          state.loading = false;
          state.error = null;
        }
      )
      .addCase(loginUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserDetails.fulfilled,
        (state, action: PayloadAction<DocumentData | null>) => {
          state.loading = false;
          state.userDetails = action.payload!;
          state.authenticate = true;
        }
      )
      .addCase(fetchUserDetails.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.userDetails = initialValues;
        state.authenticate = false;
      })
      .addCase(updateUserDetails.pending, (state) => {
        state.error = null;
      })
      .addCase(
        updateUserDetails.fulfilled,
        (state, action: PayloadAction<UserValues>) => {
          state.loading = false;
          state.userDetails = action.payload;
          state.error = null;
        }
      )
      .addCase(updateUserDetails.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, resetUser } = userSlice.actions;

export const selectUserDetails = (state: RootState) => state.user.userDetails;
export const selectAuthenticate = (state: RootState) => state.user.authenticate;
export const selectLoading = (state: RootState) => state.user.loading;
export const selectError = (state: RootState) => state.user.error;

export default userSlice.reducer;

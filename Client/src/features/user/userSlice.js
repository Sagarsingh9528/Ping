// src/redux/slices/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import toast from "react-hot-toast";

/**
 * fetchUser expects a Clerk JWT token string:
 * dispatch(fetchUser(token))
 */
export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.success ? data.user : null;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/**
 * updateUser expects { token, formData }
 * dispatch(updateUser({ token, formData }))
 */
export const updateUser = createAsyncThunk(
  "user/update",
  async ({ token, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/user/editProfile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success(data.message || "Profile updated");
        return data.user;
      } else {
        toast.error(data.message || "Update failed");
        return rejectWithValue(data.message);
      }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  value: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // optional sync reducers you might use
    setUserData(state, action) {
      state.value = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUser
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.value = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateUser
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.value = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addProjectInDatabase,
  updateProjectInDatabase,
} from "../../../helpers/db";
import { RootState } from "../store";
import { toast } from "react-toastify";
import { Project, ProjectState } from "../../../Types/types";

const initialState: ProjectState = {
  project: {},
  loading: false,
  error: null,
};

export const addOrUpdateProject = createAsyncThunk(
  "project/addOrUpdateProject",
  async (project: Project, thunkAPI) => {
    try {
      if (project.pid) {
        await updateProjectInDatabase(project, project.pid);
        toast.success("Success! Your project has been updated.", {
          autoClose: 2000,
        });
      } else {
        await addProjectInDatabase(project);
        toast.success("Success! Your project has been added👍", {
          autoClose: 2000,
        });
      }
      return project;
    } catch (error: any) {
      toast.error(error.message);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addOrUpdateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrUpdateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload;
      })
      .addCase(addOrUpdateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export const selectProjectDetails = (state: RootState) => state.project.project;
export const selectPLoading = (state: RootState) => state.project.loading;
export const selectPError = (state: RootState) => state.project.error;

export default projectSlice.reducer;

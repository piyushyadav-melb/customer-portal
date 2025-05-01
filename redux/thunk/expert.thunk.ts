import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  setExperts,
  setLoading,
  setError,
  setPagination,
  setFilters,
  setExpertDetails,
  setBookingLoading,
  setBookingError,
  setBookingSuccess,
} from "../slice/expert.slice";
import { privateClient } from "@/http/http-client";
import {
  getExperts,
  getExpertDetails,
  createBooking,
} from "@/service/expert.service";
import toast from "react-hot-toast";

interface FetchExpertsParams {
  searchText?: string;
  country?: string;
  state?: string;
  city?: string;
  gender?: string;
  consultation_language?: string;
  page?: number;
  perPage?: number;
  category?: string;
}

export const fetchExpertsThunk = createAsyncThunk(
  "expert/fetchExperts",
  async (params: FetchExpertsParams, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      console.log("PARAMS", params);
      const response = await privateClient.get("/expert", { params });
      console.log("RESPONSE", response);
      dispatch(setExperts(response.data.data.result));
      dispatch(setPagination(response.data.data.meta));
      dispatch(setFilters(params));
      return response.data.data.result;
    } catch (error: any) {
      console.log("ERROR", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch experts";
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchExpertDetails = createAsyncThunk(
  "expert/fetchExpertDetails",
  async (id: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response: any = await getExpertDetails(id);
      console.log("RESPONSE", response);
      dispatch(setExpertDetails(response.data));
    } catch (error: any) {
      dispatch(
        setError(
          error.response?.data?.message || "Failed to fetch expert details"
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createBookingThunk = createAsyncThunk(
  "expert/createBooking",
  async (payload: any, { dispatch }) => {
    try {
      dispatch(setBookingLoading(true));
      const response = await createBooking(payload);
      console.log("RESPONSE", response);
      if (response.status) {
        dispatch(setBookingSuccess(true));
        toast.success("Appointment booked successfully!", {
          duration: 5000,
          style: {
            background: "#10B981",
            color: "#fff",
            zIndex: 9999999,
          },
        });
      } else {
        dispatch(
          setBookingError(response.message || "Failed to create booking")
        );
        toast.error(response.message || "Failed to create booking");
      }
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create booking";
      dispatch(setBookingError(errorMessage));
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch(setBookingLoading(false));
    }
  }
);

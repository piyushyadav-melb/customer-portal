import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Expert } from "@/types/expert.types";

interface PaginationMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
}

interface ExpertState {
  experts: Expert[];
  expertDetails: Expert | null;
  loading: boolean;
  error: string | null;
  filters: {
    searchText: string;
    country: string;
    state: string;
    city: string;
    gender: string;
    consultation_language: string;
    category: string;
    min_consultation_charge: string;
    page: number;
    perPage: number;
  };
  pagination: PaginationMeta;
  bookingLoading: boolean;
  bookingError: string | null;
  bookingSuccess: boolean;
}

const initialState: ExpertState = {
  experts: [],
  expertDetails: null,
  loading: false,
  error: null,
  filters: {
    searchText: "",
    country: "",
    state: "",
    city: "",
    gender: "",
    consultation_language: "",
    category: "",
    min_consultation_charge: "",
    page: 1,
    perPage: 10,
  },
  pagination: {
    total: 0,
    lastPage: 1,
    currentPage: 1,
    perPage: 10,
    prev: null,
    next: null,
  },
  bookingLoading: false,
  bookingError: null,
  bookingSuccess: false,
};

const expertSlice = createSlice({
  name: "expert",
  initialState,
  reducers: {
    setExperts: (state, action: PayloadAction<Expert[]>) => {
      state.experts = action.payload;
    },
    setExpertDetails: (state, action: PayloadAction<Expert>) => {
      state.expertDetails = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilters: (state, action: PayloadAction<any>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    setPagination: (state, action: PayloadAction<any>) => {
      state.pagination = action.payload;
    },
    setBookingLoading: (state, action: PayloadAction<boolean>) => {
      state.bookingLoading = action.payload;
      if (action.payload) {
        state.bookingError = null;
        state.bookingSuccess = false;
      }
    },
    setBookingError: (state, action: PayloadAction<string | null>) => {
      state.bookingError = action.payload;
      state.bookingLoading = false;
      state.bookingSuccess = false;
    },
    setBookingSuccess: (state, action: PayloadAction<boolean>) => {
      state.bookingSuccess = action.payload;
      state.bookingLoading = false;
      state.bookingError = null;
    },
  },
});

export const {
  setExperts,
  setExpertDetails,
  setLoading,
  setError,
  setFilters,
  setPagination,
  setBookingLoading,
  setBookingError,
  setBookingSuccess,
} = expertSlice.actions;
export default expertSlice.reducer;

import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "./auth.slice";
import datatableSlice from "./datatable.slice";
import profileSlice from "./profile.slice";
import modalSlice from "./modal.slice";
import bookingsSlice from "./bookings.slice";
import meetingsSlice from "./meetings.slice";
import expertSlice from "./expert.slice";

const rootReducer: any = combineReducers({
  auth: authSlice,
  datatable: datatableSlice,
  modal: modalSlice,
  profile: profileSlice,
  bookings: bookingsSlice,
  meetings: meetingsSlice,
  expert: expertSlice,
});

export default rootReducer;

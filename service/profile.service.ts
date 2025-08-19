import { privateClient } from "@/http/http-client";
import {
  fetchProfileThunk,
  updateProfileThunk,
  fetchCustomerStatsThunk,
} from "@/redux/thunk/profile.thunk";
import { store } from "@/redux/store";

export interface UpdateProfileData {
  name: string;
  email: string;
  mobile_number: string;
  country: string;
  state: string;
  city: string;
  address_line_1: string;
  address_line_2: string;
}

//Function to fetch profile
export const fetchProfile = async () => {
  try {
    const { payload } = await store.dispatch(fetchProfileThunk());
    return {
      status: payload?.status,
      data: payload?.data,
      message: payload?.message,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

//Function to update profile
export const updateProfile = async (data: UpdateProfileData) => {
  try {
    const response = await privateClient.patch("/customer/profile", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update profile"
    );
  }
};

//Function to update profile picture
export const updateProfilePicture = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await privateClient.post(
      "/customer/profile/picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update profile picture"
    );
  }
};

export const getCustomerStats = async () => {
  try {
    const { payload }: any = await store.dispatch(fetchCustomerStatsThunk());
    return {
      status: payload?.data?.status,
      data: payload?.data?.data,
      message: payload?.data?.message,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Something went wrong.");
  }
};

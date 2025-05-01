import { createAsyncThunk } from "@reduxjs/toolkit";
import { publicClient } from "@/http/http-client";

//Thunk to handel login
interface ILoginPayload {
  email: string;
  password: string;
}

interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface IVerifyEmailPayload {
  token: string;
}

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: ILoginPayload) => {
    try {
      const res = await publicClient.post("/customer/login", payload);
      return res.data;
    } catch (error: any) {
      if (error?.response?.data) {
        return error?.response?.data;
      }
      return error;
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload: any) => {
    try {
      const res = await publicClient.post("/customer/register", payload);
      return res.data;
    } catch (error: any) {
      if (error?.response?.data) {
        return error?.response?.data;
      }
      return error;
    }
  }
);

//Thunk to handel verify email
export const verifyEmailThunk = createAsyncThunk(
  "auth/verify-email",
  async (payload: any) => {
    const res = await publicClient.post("/customer/verify-email", payload);
    return res.data;
  }
);

import { privateClient } from "@/http/http-client";
import { ExpertResponse } from "@/types/expert.types";

export const getExperts = async (params: {
  searchText?: string;
  country?: string;
  state?: string;
  city?: string;
  gender?: string;
  age?: string;
  consultation_language?: string;
  page?: number;
  perPage?: number;
  category?: string;
}): Promise<ExpertResponse> => {
  console.log("PARAMS IN SERVICE", params);
  const response = await privateClient.get("/expert", { params });
  return response.data;
};

export const getExpertDetails = async (id: string): Promise<ExpertResponse> => {
  const response = await privateClient.get(`/expert/${id}`);
  return response.data;
};

export const createBooking = async (payload: any): Promise<any> => {
  const response = await privateClient.post("/bookings/create", payload);
  return response.data;
};

import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// 🔥 interceptor (BEST WAY)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getCustomerAddresses = async () => {
  const res = await API.get("/customers/customer-addresses", {
    headers: {
      Accept: "application/json",
    },
  });

  return res.data;
};

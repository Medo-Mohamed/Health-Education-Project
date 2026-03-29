// src/api/axios.ts
import axios from "axios";
import { API_BASE_URL } from "./Constant";

const AxiosApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 👈 هذا السطر يخبر المتصفح: "احفظ الكوكيز وأرسلها مع كل طلب تلقائياً"
});

export default AxiosApi;

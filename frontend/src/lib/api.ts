import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = token;
  return config;
});

export default api;

export interface Review {
  id: number;
  book_title: string;
  body: string | null;
  rating: number;
  status: "reading" | "finished";
  likes_count: number;
  liked: boolean;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  user: { id: number; username: string };
}

export interface ReviewFormData {
  book_title: string;
  body: string;
  rating: number;
  status: "reading" | "finished";
}

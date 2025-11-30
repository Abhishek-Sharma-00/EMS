import axios from "axios";

const API = axios.create({
   baseURL:"http://localhost:5000/api/auth",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const fetchProfile = () => API.get("/me");
export const updateProfile = (data) => API.put("/update", data);
export const changePassword = (data) => API.put("/change-password", data);
export const deleteAccount = () => API.delete("/delete");

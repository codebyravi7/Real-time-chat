import axios from "axios";
const be_url = "https://real-time-chat-1-tl9r.onrender.com/api";
// const be_url = "http://localhost:5001/api";
export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? be_url
      : "/api",
  withCredentials: true,
});

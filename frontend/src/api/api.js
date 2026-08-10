import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

// Remove trailing slashes from API request URLs
api.interceptors.request.use((config) => {
    if (config.url) {
        config.url = config.url.replace(/\/+$/, "");
    }

    return config;
});

export default api;

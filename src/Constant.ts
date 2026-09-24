const url =
  import.meta.env.VIET_STATE === "DEVOLOP"
    ? import.meta.env.VITE_LOCAL_API_URL
    : import.meta.env.VITE_ONLINE_API_URL;

export const API_BASE_URL = url;

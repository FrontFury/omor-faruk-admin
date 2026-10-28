import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";


const axiosSecure = axios.create({
  baseURL: "https://md-omar-faruk-server.vercel.app",
});

const useAxiosSecure = () => {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    // 1. REQUEST INTERCEPTOR: টোকেন পাঠানোর জন্য
    const requestInterceptor = axiosSecure.interceptors.request.use(
      async (config) => {
        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );


    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const status = error.response ? error.response.status : null;

        if (status === 401 || status === 403) {
          if (logout) {
            await logout();
          }
          navigate("/login"); 
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [user, logout, navigate]);

  return axiosSecure;
};

export default useAxiosSecure;
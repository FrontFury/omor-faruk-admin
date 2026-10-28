import axios from "axios";

const axiosSecure = axios.create({
  baseURL: "https://md-omar-faruk-server.vercel.app", 
});

const useAxios = () => {
    
    return axiosSecure;
};

export default useAxios;
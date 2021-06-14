import axios, { AxiosError } from 'axios';

const host =
  process.env.NODE_ENV === 'development'
    ? '/'
    : process.env.REACT_APP_API_HOST ?? '/';

const apiClient = axios.create({
  baseURL: host,
  // withCredentials: true,
});

export const processAxiosError = (error: AxiosError) => {
    alert(error.response?.data?.text);
};


export default apiClient;

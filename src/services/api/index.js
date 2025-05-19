import axios from 'axios';

export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === UNAUTHORIZED_CODE) {
//       localStorage.removeItem('jwt');
//       window.location.href = '/';
//     }
//     return Promise.reject(error);
//   },
// );

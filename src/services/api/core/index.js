import axios from 'axios';

import { CoreConfigProvider } from './config';

const axiosInstance = axios.create();

const UNAUTHORIZED_CODE = 401;

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === UNAUTHORIZED_CODE) {
      localStorage.removeItem('jwt');
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

export class CoreApiProvider {
  static async login({ signature, stakeAddress }) {
    const response = await axiosInstance.post(CoreConfigProvider.login(), {
      signature,
      stakeAddress,
    });
    return response;
  }

  static async getProfile() {
    const response = await axiosInstance.get(CoreConfigProvider.profile());
    return response;
  }
}

import axios from 'axios';
import * as Sentry from '@sentry/react';

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

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data, config } = error.response;

      Sentry.captureException(error, {
        level: status >= 500 ? 'error' : 'warning',
        tags: {
          error_type: 'api_error',
          status_code: status,
          endpoint: `${config.method?.toUpperCase()} ${config.url}`,
        },
        extra: {
          response_data: data,
          request_data: config.data,
          request_params: config.params,
          request_headers: config.headers,
        },
      });
    } else if (error.request) {
      Sentry.captureException(error, {
        level: 'error',
        tags: {
          error_type: 'network_error',
        },
        extra: {
          request: error.request,
        },
      });
    }

    return Promise.reject(error);
  }
);

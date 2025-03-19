import { CoreConfigProvider } from './config';
import { axiosInstance } from '@/services/api';

export class CoreApiProvider {
  static async login({ signature, stakeAddress }) {
    const response = await axiosInstance.post(CoreConfigProvider.login(), {
      signature,
      stakeAddress,
    });
    return response;
  }

  static async getProfile() {
    const response = await axiosInstance.get(CoreConfigProvider.getProfile());
    return response;
  }

  static async updateProfile(profileData) {
    const response = await axiosInstance.patch(CoreConfigProvider.updateProfile(), profileData);
    return response;
  }

  static async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axiosInstance.post(
      CoreConfigProvider.uploadImage(),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response;
  }
}

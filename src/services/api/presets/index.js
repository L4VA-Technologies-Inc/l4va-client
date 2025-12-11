import { axiosInstance } from '@/services/api';
import { PresetsConfigProvider } from '@/services/api/presets/config.js';

export class PresetsApiProvider {
  static async getAllPresets() {
    return await axiosInstance.get(PresetsConfigProvider.getAllPresets());
  }

  static async createPreset(payload) {
    return await axiosInstance.post(PresetsConfigProvider.getAllPresets(), payload);
  }

  static async deletePreset(presetId) {
    return await axiosInstance.delete(`${PresetsConfigProvider.getAllPresets()}/${presetId}`);
  }
}

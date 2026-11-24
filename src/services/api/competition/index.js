import { axiosInstance } from '@/services/api';

export class CompetitionApiProvider {
  static async getLeaderboard(season) {
    return await axiosInstance.get('/api/v1/competition/leaderboard', { params: season ? { season } : undefined });
  }
}

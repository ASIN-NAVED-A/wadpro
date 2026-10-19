import apiClient from '../client';
import { USER_FIELD_MAP } from '../fieldMap';

export const userService = {
  async getProfile() {
    const response = await apiClient.get('/users/me');
    return USER_FIELD_MAP.fromBackendUser(response.data?.user || response.data);
  },

  async updateAccount(data) {
    const response = await apiClient.patch('/users/me', data);
    return USER_FIELD_MAP.fromBackendUser(response.data?.user || response.data);
  },
};

export default userService;

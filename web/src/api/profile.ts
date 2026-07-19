import request from './request';

export const profileApi = {
  getProfile: () =>
    request.get('/profile').then((r) => r.data),

  updateProfile: (data: {
    display_name?: string;
    theme_pref?: string;
    auto_archive_enabled?: boolean;
    auto_archive_days?: number;
  }) =>
    request.put('/profile', data).then((r) => r.data),
};

import request from './request';

interface LoginResponse {
  code: number;
  data: { token: string; user: any };
  message: string;
}

export const authApi = {
  login: (email: string, password: string): Promise<LoginResponse> =>
    request.post('/auth/login', { email, password }).then((r) => r.data),

  register: (
    email: string,
    password: string,
    displayName?: string,
  ): Promise<LoginResponse> =>
    request
      .post('/auth/register', { email, password, display_name: displayName })
      .then((r) => r.data),

  logout: (): Promise<any> =>
    request.post('/auth/logout').then((r) => r.data),

  me: (): Promise<any> =>
    request.get('/auth/me').then((r) => r.data),
};

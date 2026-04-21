import axios from 'axios';

describe('GET /api/v1', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api/v1`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'VisibleFix API' });
  });
});

describe('POST /api/v1/auth/sign-up', () => {
  it('should create a new user and return a session', async () => {
    const newUser = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
    };

    try {
      const res = await axios.post(`/api/v1/auth/sign-up`, newUser);

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.user.email).toBe(newUser.email);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error response:', error.response?.data);
      }
      throw error;
    }
  });
});

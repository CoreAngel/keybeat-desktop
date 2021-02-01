import PasswordService from '../../react/services/passwordService';

describe('Password Service', () => {
  it('should not throw error', async () => {
    const passwordService = new PasswordService();
    await expect(passwordService.setUserPassword('login', 'password')).resolves.toBe(undefined);
  });

  it('should set and get password', async () => {
    const passwordService = new PasswordService();
    await passwordService.setUserPassword('login', 'password');
    const password = await passwordService.getPassword();
    await expect(password).toBe('password');
  });

  it('should clear password', async () => {
    const passwordService = new PasswordService();
    await passwordService.setUserPassword('login', 'password');
    await passwordService.clear();
    const password = await passwordService.getPassword();
    await expect(password).toBe(null);
  });
});

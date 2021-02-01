import PasswordService from '../../react/services/passwordService';
import EncryptionService from '../../react/services/encryptionService';
import { sha } from '../../libs/src/functions/crypto';
import { toHex } from '../../libs/src/functions/utils';

describe('Encrypted Service', () => {
  let passwordService: PasswordService;
  let encryptedService: EncryptionService;

  beforeAll(async () => {
    passwordService = new PasswordService();
    await passwordService.setUserPassword('login', toHex(sha('password')));
    encryptedService = new EncryptionService(passwordService);
  });

  afterAll(async () => {
    await passwordService.clear();
  });

  it('should encrypt and decrypt string', async () => {
    const str = 'secretData';
    const encrypted = await encryptedService.encryptString(str);
    const decrypted = await encryptedService.decryptString(encrypted);

    await expect(decrypted).toBe(str);
  });

  // it('should encrypt and decrypt credential', async () => {
  //   const credential = {
  //     name: 'name',
  //     login: 'login',
  //     password: 'password',
  //   };
  //   const encrypted = await encryptedService.encryptCredential(credential);
  //   const decrypted = await encryptedService.decryptCredential(encrypted);
  //
  //   await expect(decrypted).toBe(credential);
  // });
});

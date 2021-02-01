import { getPassword, setPassword, deletePassword } from 'keytar';
import { randomBytes } from '../../libs/src/functions/utils';
import { aesDecrypt, aesEncrypt, sha } from '../../libs/src/functions/crypto';

export default class PasswordService {
  private login = '';
  private password = '';

  public setUserPassword = async (login: string, password: string) => {
    this.login = login;
    const key = sha(randomBytes(32));
    this.password = aesEncrypt(key, password);
    await setPassword('keybeat', login, key);
  };

  public getPassword = async () => {
    if (this.login === '') {
      return null;
    }
    const key = await getPassword('keybeat', this.login);
    return aesDecrypt(key, this.password);
  };

  public clear = async () => {
    await deletePassword('keybeat', this.login);
    this.login = '';
    this.password = '';
  };
}

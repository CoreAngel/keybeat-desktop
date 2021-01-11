import { aesDecrypt, aesEncrypt } from '../../libs/src/functions/crypto';
import PasswordService from './passwordService';
import { fromBase64, fromHex, toBase64 } from '../../libs/src/functions/utils';

interface CredentialType {
  name: string;
  login: string;
  password: string;
}

export default class EncryptionService {
  constructor(private passwordService: PasswordService) {}

  public decryptCredential = async (data: string): Promise<CredentialType | undefined> => {
    const decryptedCredential = await this.decryptString(data);
    const { name, login, password } = JSON.parse(decryptedCredential);
    return {
      name,
      login,
      password,
    };
  };

  public encryptCredential = async (credential: CredentialType): Promise<string> => {
    const jsonString = JSON.stringify(credential);
    return this.encryptString(jsonString);
  };

  public decryptString = async (data: string): Promise<string> => {
    const masterPassword = await this.passwordService.getPassword();
    const masterKey = fromHex(masterPassword);
    return aesDecrypt(masterKey, fromBase64(data));
  };

  public encryptString = async (data: string): Promise<string> => {
    const masterPassword = await this.passwordService.getPassword();
    const masterKey = fromHex(masterPassword);
    return toBase64(aesEncrypt(masterKey, data));
  };
}

import { keyTap, typeString } from 'robotjs';
import ClipboardService from '../../libs/src/services/clipboardService';

export enum AutotypeTypes {
  NORMAL = 'normal',
  TWO_CHANNEL = 'twoChannel',
}

export default class AutoTypeService {
  private password = '';
  private type = AutotypeTypes.NORMAL;

  public setPassword = (password: string) => {
    this.password = password;
  };

  public setType = (type: AutotypeTypes) => {
    this.type = type;
  };

  public clearPassword = () => {
    this.password = '';
  };

  public autoType = () => {
    if (this.password !== '') {
      setTimeout(async () => {
        if (this.type === AutotypeTypes.NORMAL) {
          await this.normal();
        } else {
          await this.twoChannel();
        }
        this.clearPassword();
      }, 500);
    }
  };

  private normal = async () => {
    typeString(this.password);
  };

  private twoChannel = async () => {
    const clipboard = new ClipboardService();
    const passLength = this.password.length;
    if (passLength < 4) {
      this.normal();
    } else {
      const partLength = Math.floor(passLength / 3);
      const lastPartLength = passLength - 2 * partLength;
      const firstPart = this.password.substr(0, partLength);
      const secondPart = this.password.substr(partLength, partLength);
      const thirdPart = this.password.substr(2 * partLength);

      await clipboard.write(firstPart + thirdPart);
      keyTap('v', 'control');
      for (let i = 0; i < lastPartLength; i += 1) {
        keyTap('left');
      }
      typeString(secondPart);
    }
  };
}

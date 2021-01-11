import { ipcRenderer } from 'electron';
import { AutotypeTypes } from './autoTypeService';

export enum CommunicationTypes {
  CLEAR_CLIPBOARD = 'communicationClearClipboard',
  AUTOTYPE_PASSWORD = 'communicationAutotypePassword',
  AUTOTYPE_TYPE = 'communicationAutotypeType',
}

export interface ClearClipboardType {
  hash: string;
}

export interface AutotypePasswordType {
  password: string;
}

export interface AutotypeTypeType {
  type: AutotypeTypes;
}

export default class CommunicationService {
  public clearClipboard = (data: ClearClipboardType) => {
    ipcRenderer.send(CommunicationTypes.CLEAR_CLIPBOARD, data);
  };

  public setAutoTypePassword = (data: AutotypePasswordType) => {
    ipcRenderer.send(CommunicationTypes.AUTOTYPE_PASSWORD, data);
  };

  public setAutoTypeType = (data: AutotypeTypeType) => {
    ipcRenderer.send(CommunicationTypes.AUTOTYPE_TYPE, data);
  };
}

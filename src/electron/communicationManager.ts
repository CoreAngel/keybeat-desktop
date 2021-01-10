import { ipcMain, globalShortcut } from 'electron';
import {
  CommunicationTypes,
  ClearClipboardType,
  AutotypePasswordType,
  AutotypeTypeType,
} from '../react/services/communicationService';
import ClipboardService from '../libs/src/services/clipboardService';
import AutoTypeService from '../react/services/autoTypeService';

export default class CommunicationManager {
  private autotypeService = new AutoTypeService();

  public init = async () => {
    this.registerShortcut();
    this.onClearClipboard();
    this.onAutoType();
  };

  private registerShortcut = () => {
    globalShortcut.register('CommandOrControl+F8', () => {
      this.autotypeService.autoType();
    });
  };

  private onClearClipboard = () => {
    ipcMain.on(CommunicationTypes.CLEAR_CLIPBOARD, (_, { hash }: ClearClipboardType) => {
      const service = new ClipboardService();
      service.clear(hash);
    });
  };

  private onAutoType = () => {
    ipcMain.on(CommunicationTypes.AUTOTYPE_PASSWORD, (_, { password }: AutotypePasswordType) => {
      this.autotypeService.setPassword(password);
    });

    ipcMain.on(CommunicationTypes.AUTOTYPE_TYPE, (_, { type }: AutotypeTypeType) => {
      this.autotypeService.setType(type);
    });
  };
}

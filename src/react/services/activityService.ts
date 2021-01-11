import { fromEvent, interval, Subject, Subscription } from 'rxjs';
import { ipcRenderer } from 'electron';
import { throttle } from 'rxjs/operators';

export enum ActivityActions {
  CLOSE = 'activityClose',
  REFRESH = 'activityRefresh',
}

export default class ActivityService {
  private listener = new Subject();
  private lastMoveTime = 0;
  private moveSub: Subscription | null = null;
  private keySub: Subscription | null = null;
  private interval: NodeJS.Timeout | null = null;

  public start = () => {
    this.finish();
    this.lastMoveTime = Date.now();
    this.bindEvent();
    this.bindInterval();
    this.bindListeners();
  };

  public finish = () => {
    clearInterval(this.interval);
    this.clearEvent();
    this.clearListeners();
  };

  public onInteractive = () => this.listener.asObservable();

  private bindEvent = () => {
    this.moveSub = fromEvent(window, 'mousemove')
      .pipe(throttle(() => interval(1000)))
      .subscribe(() => {
        this.lastMoveTime = Date.now();
      });

    this.keySub = fromEvent(window, 'keydown')
      .pipe(throttle(() => interval(1000)))
      .subscribe(() => {
        this.lastMoveTime = Date.now();
      });
  };

  private clearEvent = () => {
    this.moveSub?.unsubscribe();
    this.keySub?.unsubscribe();
  };

  private bindInterval = () => {
    const inactiveTime = 10 * 60 * 1000; // 10 min
    this.interval = setInterval(() => {
      const currTime = Date.now();
      if (this.lastMoveTime + inactiveTime < currTime) {
        this.emitInactiveAction();
      }
    }, 1000);
  };

  private bindListeners = () => {
    ipcRenderer.on(ActivityActions.CLOSE, this.emitInactiveAction);
    ipcRenderer.on(ActivityActions.REFRESH, this.setCurrentTime);
  };

  private clearListeners = () => {
    ipcRenderer.off(ActivityActions.CLOSE, this.emitInactiveAction);
    ipcRenderer.off(ActivityActions.REFRESH, this.setCurrentTime);
  };

  private emitInactiveAction = () => {
    this.listener.next();
  };

  private setCurrentTime = () => {
    this.lastMoveTime = Date.now();
  };
}

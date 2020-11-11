import { Subscription, Subject } from 'rxjs';
import { OnDestroy, Injectable } from '@angular/core';

@Injectable()
export abstract class BaseComponent implements OnDestroy {
  // tslint:disable-next-line:variable-name
  public _subscription = new Subscription();
  public loading: {
    [key: string]: boolean
  } = {};
  public ngDestroyed$ = new Subject();
  public ngOnDestroy() {
    this._subscription.unsubscribe();
    this.ngDestroyed$.next();
    this.ngDestroyed$.unsubscribe();
  }
  public trackByIndex(index: number, item: any) {
    return index;
  }
  public trackById(index: number, item: any) {
    return item._id || item.id;
  }
}

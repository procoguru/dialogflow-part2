import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker'
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {

  private updateAvailableSubject = new Subject<boolean>();
  promptAvailable = null;

  constructor(
    swUpdate: SwUpdate,
  ) {

    window.addEventListener('beforeinstallprompt', event => {
      this.promptAvailable = event;
    });

    swUpdate.available.subscribe(event => {
      this.setUpdateAvailable(true);
    });

  }

  setUpdateAvailable(state: boolean) {
    this.updateAvailableSubject.next(state);
  }

  getUpdateAvailable(): Observable<boolean> {
    return this.updateAvailableSubject.asObservable();
  }
}

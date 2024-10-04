import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  private threadSubject = new BehaviorSubject<any>(null);
  private ThreadAnimation = new BehaviorSubject<any>(null);

  currentThread$ = this.threadSubject.asObservable();
  ThreadAnimation$ = this.ThreadAnimation.asObservable();

  openThread(thread: any) {
    this.threadSubject.next(thread);
    setTimeout(() => {
      document.getElementById('slideIn')?.classList.add('slide-in-right');
    }, 1);
  }

  closeThread() {
    let element = document.getElementById('slideIn');
    element?.classList.remove('slide-in-right');
    element?.classList.add('slide-out-right');
    this.threadSubject.next(null);
  }

  isThreadOpen(): boolean {
    return this.threadSubject.getValue() !== null;
  }
}

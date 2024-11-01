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

  /**
   * Opens a thread by updating the thread subject and adding a CSS class for animation.
   * @param {any} thread - The thread object to open.
   */
  openThread(thread: any) {
    this.threadSubject.next(thread);
    setTimeout(() => {
      document.getElementById('slideIn')?.classList.add('slide-in-right');
    }, 1);
  }

  /**
   * Closes the currently open thread by removing the animation class and resetting the thread subject.
   */
  closeThread() {
    let element = document.getElementById('slideIn');
    element?.classList.remove('slide-in-right');
    element?.classList.add('slide-out-right');
    this.threadSubject.next(null);
  }

  /**
   * Checks if a thread is currently open.
   * @returns {boolean} True if a thread is open, otherwise false.
   */
  isThreadOpen(): boolean {
    return this.threadSubject.getValue() !== null;
  }
}

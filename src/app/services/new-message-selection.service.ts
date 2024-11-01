import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NewMessageSelectionService {
  private allUserSortedSubject = new BehaviorSubject<any[]>([]);
  private allChannelSortedSubject = new BehaviorSubject<any[]>([]);
  private selectedChannel = new BehaviorSubject<any[]>([]);
  private uid = new BehaviorSubject<any[]>([]);

  /**
   * Sets the sorted user data and emits it to subscribers.
   *
   * @param {any[]} data - The sorted user data to be set.
   * @returns {void}
   */
  setAllUserSorted(data: any[]) {
    this.allUserSortedSubject.next(data);
  }

  /**
   * Returns an observable of the sorted user data.
   *
   * @returns {Observable<any[]>} - An observable that emits the sorted user data.
   */
  getAllUserSorted() {
    return this.allUserSortedSubject.asObservable(); // Return as Observable
  }

  /**
   * Sets the sorted channel data and emits it to subscribers.
   *
   * @param {any[]} data - The sorted channel data to be set.
   * @returns {void}
   */
  setAllChannelSorted(data: any[]) {
    this.allChannelSortedSubject.next(data);
  }

  /**
   * Returns an observable of the sorted channel data.
   *
   * @returns {Observable<any[]>} - An observable that emits the sorted channel data.
   */
  getAllChannelSorted() {
    return this.allChannelSortedSubject.asObservable(); // Return as Observable
  }

  /**
   * Sets the selected channel data and emits it to subscribers.
   *
   * @param {any[]} data - The selected channel data to be set.
   * @returns {void}
   */
  setselectedChannel(data: any[]) {
    this.selectedChannel.next(data);
  }

  /**
   * Returns an observable of the selected channel data.
   *
   * @returns {Observable<any[]>} - An observable that emits the selected channel data.
   */
  getselectedChannel() {
    return this.selectedChannel.asObservable(); // Return as Observable
  }

  /**
   * Sets the selected user ID data and emits it to subscribers.
   *
   * @param {any[]} data - The selected user ID data to be set.
   * @returns {void}
   */
  setselecteduid(data: any[]) {
    this.uid.next(data);
  }

  /**
   * Returns an observable of the selected user ID data.
   *
   * @returns {Observable<any[]>} - An observable that emits the selected user ID data.
   */
  getselecteduid() {
    return this.uid.asObservable(); // Return as Observable
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DirectMessageSelectionService {
  private selectedUser = new BehaviorSubject<any>(null); // Initialer Wert kann auch null sein

  constructor() {}

  // Getter für selectedChannel als Observable
  getSelectedChannel() {
    return this.selectedUser.asObservable();
  }

  // Setter für selectedChannel
  setSelectedChannel(channel: any) {
    this.selectedUser.next(channel);
  }
}

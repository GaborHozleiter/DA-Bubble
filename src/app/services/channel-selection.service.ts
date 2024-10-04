import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChannelSelectionService {
  private selectedChannel = new BehaviorSubject<string>('');
  private selectedReaction = new BehaviorSubject<string>('');
  private selectedImg = new BehaviorSubject<any>('');
  ChannelOpenVariable: any = 'channel';
  constructor() {}

  // Getter for selectedChannel as an Observable
  getSelectedChannel() {
    return this.selectedChannel.asObservable();
  }

  getselectedReaction() {
    return this.selectedReaction.asObservable();
  }

  getselectedIMG() {
    return this.selectedImg.asObservable();
  }

  isChannelOpen() {
    return this.ChannelOpenVariable;
  }

  openChannel() {
    this.ChannelOpenVariable = 'channel';
  }

  openDirectMessage() {
    this.ChannelOpenVariable = 'directMessage';
  }

  openNewMessage() {
    this.ChannelOpenVariable = 'newMessage';
  }

  closeChannel() {
    this.ChannelOpenVariable = false;
  }

  // Setter for selectedChannel
  setSelectedChannel(channel: string): void {
    this.selectedChannel.next(channel);
  }

  setSelectedImg(src: any): void {
    this.selectedImg.next(src);
  }

  setselectedReaction(reactions: string): void {
    this.selectedReaction.next(reactions);
  }
}

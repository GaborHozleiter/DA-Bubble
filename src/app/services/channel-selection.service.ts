import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChannelSelectionService {
  private selectedChannel = new BehaviorSubject<string>('');
  private selectedReaction = new BehaviorSubject<string>('');
  private selectedImg = new BehaviorSubject<any>('');
  activeChannelId: string | null = null; 
  ChannelOpenVariable: any = 'channel';
  selectedChannelIndex: any;
  private blockChannelUpdates = false; 
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

  setSelectedChannel(channel: string): void {
    if (!this.blockChannelUpdates) { 
      this.selectedChannel.next(channel);
    }
  }

  blockUpdatesTemporarily() {
    this.blockChannelUpdates = true;
    setTimeout(() => {
      this.blockChannelUpdates = false;
    }, 200); 
  }

  setSelectedImg(src: any): void {
    this.selectedImg.next(src);
  }

  setselectedReaction(reactions: string): void {
    this.selectedReaction.next(reactions);
  }
}

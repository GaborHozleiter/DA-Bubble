import { Component, inject } from '@angular/core';
import { ThreadService } from '../../../services/thread.service';
import { ResponsiveService } from '../../../services/responsive.service';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { ChatAreaService } from '../../../services/chat-area.service';
import { ChannelSelectionService } from '../../../services/channel-selection.service';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'app-thread-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thread-header.component.html',
  styleUrl: './thread-header.component.scss',
})
export class ThreadHeaderComponent {
  constructor(
    private threadService: ThreadService,
    private firestore: Firestore,
    public channelSelectionService: ChannelSelectionService,
    public chatAreaService: ChatAreaService
  ) {}
  channelInfo = inject(SidebarService);
  responsiveService = inject(ResponsiveService);
  allChannels: any = [];
  currentChannelId: any;
  currentChannel: any;

  ngAfterViewInit(): void {
    this.channelSelectionService.getSelectedChannel().subscribe((channel) => {
      this.currentChannelId = channel;
      this.subChannels();
    });
  }

  /**
   * Closes the current thread by invoking the thread service's closeThread method
   * and updating the responsive service to indicate that the thread is no longer open.
   *
   * @method closeThread
   * @memberof YourClassName
   * @returns {void} This method does not return a value.
   */
  closeThread() {
    this.threadService.closeThread();
    this.responsiveService.isThreadOpen = false;
    if (this.responsiveService.width < 1350) {
      this.channelInfo.sidebarOpen = false;
    }
  }

  /**
   * Subscribes to the 'Channels' collection in Firestore and listens for updates.
   * Upon receiving a snapshot, it processes each channel document,
   * updates the allChannels array, and sets the currentChannel
   * if the channel's ID matches the currentChannelId.
   *
   * @method subChannels
   * @memberof YourClassName
   * @returns {void} This method does not return a value.
   *
   * @example
   * // To use this method, simply call it on an instance of YourClassName.
   * instance.subChannels();
   */
  subChannels(): void {
    const q = query(collection(this.firestore, 'Channels'), limit(1000));
    onSnapshot(q, (list) => {
      this.allChannels = [];
      let channel: any;
      list.forEach((element) => {
        channel = this.chatAreaService.setNoteChannel(
          element.data(),
          element.id
        );
        this.allChannels.push(channel);

        if (channel.id == this.currentChannelId) {
          this.currentChannel = channel;
        }
      });
    });
  }
}

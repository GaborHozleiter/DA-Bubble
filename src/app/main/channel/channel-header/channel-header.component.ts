import { Component, inject } from '@angular/core';
import { EditChannelComponent } from '../../edit-channel/edit-channel.component';
import { EditChannelService } from '../../../services/edit-channel.service';
import { ChannelSelectionService } from '../../../services/channel-selection.service';
import { SidebarService } from '../../../services/sidebar.service';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-channel-header',
  standalone: true,
  imports: [EditChannelComponent, CommonModule],
  templateUrl: './channel-header.component.html',
  styleUrls: [
    './channel-header.component.scss',
    './channel-header-responsiv.component.scss',
  ],
})
export class ChannelHeaderComponent {
  currentChannelId: any;
  currentChannel: any;
  channelInfo = inject(SidebarService);
  userNumber: number = 0;
  divHover = false;

  constructor(
    private firestore: Firestore,
    public editChannelService: EditChannelService,
    private channelSelectionService: ChannelSelectionService,
    public chatAreaService: ChatAreaService
  ) { }

  /**
 * Initializes the component by subscribing to the selected channel changes.
 *
 * @void
 *
 * @description
 * - Retrieves the currently selected channel using `channelSelectionService`.
 * - Updates `currentChannelId` with the selected channel.
 * - Calls `subChannels` to perform additional setup or subscriptions related to the channel.
 */
  ngOnInit(): void {
    this.channelSelectionService.getSelectedChannel().subscribe((channel) => {
      this.currentChannelId = channel;
      this.subChannels();
    });
  }

  /**
 * Opens the dialog to add a user to the current channel.
 *
 * @void
 *
 * @description
 * - Sets `addUserFromHeaderToChannelOpen` to true to display the user addition dialog.
 */
  openAddUserToChannel() {
    this.channelInfo.addUserFromHeaderToChannelOpen = true;
  }

  /**
 * Opens the user list in the current channel.
 *
 * @description
 *  Sets `openUserList` to true to display the user list interface.
 */
  openUserList() {
    this.channelInfo.openUserList = true;
  }

  /**
 * Subscribes to the channels collection in Firestore and updates the current channel.
 *
 * @void
 *
 * @description
 * - Queries the `Channels` collection with a limit of 1000 documents.
 * - Listens for changes in the channels collection using `onSnapshot`.
 * - Iterates through the channel documents, setting the channel data with `setNoteChannel`.
 * - Updates `currentChannel` if the channel ID matches `currentChannelId`.
 * - Calls `setUserNumberBasedOnImages` to update the user number based on images.
 */
  subChannels() {
    const q = query(collection(this.firestore, 'Channels'), limit(1000));
    onSnapshot(q, (list) => {
      let channel: any;
      list.forEach((element) => {
        channel = this.chatAreaService.setNoteChannel(
          element.data(),
          element.id
        );
        if (channel.id === this.currentChannelId) {
          this.currentChannel = channel;
          this.setUserNumberBasedOnImages();
        }
      });
    });
  }

  /**
 * Updates the user number based on the images in the current channel.
 *
 * @void
 *
 * @description
 * - Checks if `AllChannelsImages` exists and if `currentChannelNumber` is defined.
 * - Retrieves the images for the current channel based on the channel number.
 * - Sets `userNumber` to the length of `currentChannel.images` if images exist; otherwise, sets it to 0.
 * - If the conditions are not met, `userNumber` is also set to 0.
 */
  setUserNumberBasedOnImages() {
    if (
      this.channelInfo.AllChannelsImages &&
      this.channelInfo.currentChannelNumber !== undefined
    ) {
      const images =
        this.channelInfo.AllChannelsImages[
        this.channelInfo.currentChannelNumber
        ];
      if (images) {
        this.userNumber = this.currentChannel.images.length;
      } else {
        this.userNumber = 0;
      }
    } else {
      this.userNumber = 0;
    }
  }

  /**
 * Sets the hover state to true.
 *
 * @void
 *
 * @description
 * - Updates `divHover` to true to indicate that the element is being hovered over.
 */
  hover() {
    this.divHover = true;
  }

  /**
 * Resets the hover state to false.
 *
 * @void
 *
 * @description
 * - Updates `divHover` to false to indicate that the element is no longer being hovered over.
 */
  hoverOff() {
    this.divHover = false;
  }
}

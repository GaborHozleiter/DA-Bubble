import { Component, inject } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ChannelSelectionService } from '../../services/channel-selection.service';
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
import { ChatAreaService } from '../../services/chat-area.service';

@Component({
  selector: 'app-channel-userlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel-userlist.component.html',
  styleUrls: [
    './channel-userlist.component.scss',
    './channel-userlist-responsive.component.scss',
  ],
})
export class ChannelUserlistComponent {
  channelInfo = inject(SidebarService);
  authService = inject(AuthService);
  currentChannelId: any = '';
  allUser: any = [];
  currentChannel: any;
  user: any;

  constructor(
    public channelSelectionService: ChannelSelectionService,
    private firestore: Firestore,
    public chatAreaService: ChatAreaService
  ) { }

  /**
 * Initializes the component after the view has been fully initialized.
 *
 * @void
 *
 * @description
 * - Subscribes to the selected channel changes from `channelSelectionService`.
 * - Updates `currentChannelId` with the selected channel.
 * - Calls `subUser` and `subChannels` to set up user and channel subscriptions.
 */
  ngAfterViewInit(): void {
    this.channelSelectionService.getSelectedChannel().subscribe((channel) => {
      this.currentChannelId = channel;
      this.subUser();
      this.subChannels();
    });
  }

  /**
 * Subscribes to the users collection in Firestore and updates the user list.
 *
 * @void
 *
 * @description
 * - Queries the `Users` collection with a limit of 1000 documents.
 * - Listens for changes in the users collection using `onSnapshot`.
 * - Iterates through the user documents, pushing each user object into `allUser` 
 *   after processing it with `setNoteObjectUser`.
 * - Calls `setOpenUser` to handle any updates related to the user list.
 */
  subUser() {
    const q = query(collection(this.firestore, 'Users'), limit(1000));
    onSnapshot(q, (list) => {
      this.allUser = [];
      list.forEach((element) => {
        this.allUser.push(
          this.chatAreaService.setNoteObjectUser(element.data(), element.id)
        );
      });
      this.setOpenUser();
    });
  }

  /**
 * Subscribes to the channels collection in Firestore and updates the current channel.
 *
 * @void
 *
 * @description
 * - Queries the `Channels` collection with a limit of 1000 documents.
 * - Listens for changes in the channels collection using `onSnapshot`.
 * - Iterates through the channel documents, updating `currentChannel` 
 *   if the channel ID matches `currentChannelId`.
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
        if (channel.id == this.currentChannelId) {
          this.currentChannel = channel;
        }
      });
    });
  }

  /**
 * Retrieves a user object by UID from the list of all users.
 *
 * @param {any} uid - The UID of the user to be retrieved.
 * @returns {object} The user object if found, or an object with `name` set to undefined if not found.
 *
 * @description
 * - Iterates through the `allUser` array to find a user with the matching UID.
 * - Returns the user object if a match is found; otherwise, returns an object 
 *   with `name` set to undefined.
 */
  getUser(uid: any) {
    for (let i = 0; i < this.allUser.length; i++) {
      const element = this.allUser[i];
      if (element.uid === uid) {
        return element;
      }
    }
    return { name: undefined };
  }

  /**
 * Sets the currently open user based on the authentication service.
 *
 * @void
 *
 * @description
 * - Updates the `user` property with the UID of the current user 
 *   obtained from the `authService`.
 */
  setOpenUser() {
    this.user = this.authService.currentUserSignal()?.uId;
  }

  /**
 * Closes the user list dialog.
 *
 * @void
 *
 * @description
 * - Sets `openUserList` to false to hide the user list dialog.
 */
  closeDialog() {
    this.channelInfo.openUserList = false;
  }

  /**
 * Prevents the dialog from closing when an event occurs.
 *
 * @param {any} e - The event object that triggered the function.
 * @void
 *
 * @description
 * - Stops the propagation of the event to prevent the dialog from closing.
 */
  notCloseDialog(e: any) {
    e.stopPropagation(e);
  }

  /**
 * Opens the dialog for adding a user to the channel.
 *
 * @void
 *
 * @description
 * - Sets `addUserFromHeaderToChannelOpen` to true to display the add user dialog.
 * - Calls `closeDialog` to ensure any existing dialogs are closed.
 */
  addUserToChannel() {
    this.channelInfo.addUserFromHeaderToChannelOpen = true;
    this.closeDialog();
  }

  /**
 * Opens the user profile dialog for a specified user.
 *
 * @param {number} i - The index of the user whose profile is to be opened.
 * @void
 *
 * @description
 * - Sets `userProfilOpen` to true to display the user profile dialog.
 * - Updates `activeUserProfil`, `activeUser`, `activeEmail`, `activeImage`, 
 *   and `activeUid` with the corresponding values from the channel's user data.
 * - Calls `closeDialog` to ensure any existing dialogs are closed.
 */
  openUserProfil(i: number) {
    this.channelInfo.userProfilOpen = true;
    this.channelInfo.activeUserProfil = i;
    this.channelInfo.activeUser =
      this.channelInfo.AllChannelsUsers[this.channelInfo.currentChannelNumber][i];
    this.channelInfo.activeEmail =
      this.channelInfo.AllChannelsEmails[this.channelInfo.currentChannelNumber][i];
    this.channelInfo.activeImage =
      this.channelInfo.AllChannelsImages[this.channelInfo.currentChannelNumber][i];
    this.channelInfo.activeUid =
      this.channelInfo.GlobalChannelUids[this.channelInfo.currentChannelNumber][i];
    this.closeDialog();
  }
}

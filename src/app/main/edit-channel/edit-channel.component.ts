import { Component, inject, OnInit } from '@angular/core';
import { EditChannelService } from '../../services/edit-channel.service';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
} from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ChannelSelectionService } from '../../services/channel-selection.service';
import { ThreadService } from '../../services/thread.service';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-channel.component.html',
  styleUrls: [
    './edit-channel.component.scss',
    './edit-channel-responsive.component.scss',
  ],
})
export class EditChannelComponent implements OnInit {
  currentChannel: any;
  channel: any;
  selectetChannelData: any;
  originalChannelData: any;
  editChannelNameOpen = false;
  editChannelDescriptionOpen = false;
  channelName = '';
  channelDescription = '';
  channelInfo = inject(SidebarService);
  authService = inject(AuthService);

  constructor(
    public editChannelService: EditChannelService, // Füge den Service hier hinzu
    private firestore: Firestore,
    private channelSelectionService: ChannelSelectionService,
    private threadService: ThreadService
  ) {}

  /**
 * Initializes the component by subscribing to the selected channel.
 * Logs the selected channel to the console and sets it as the current channel,
 * then calls `subMessages()` to subscribe to messages within the selected channel.
 */
  ngOnInit(): void {
    this.channelSelectionService.getSelectedChannel().subscribe((channel) => {
      this.currentChannel = channel;
      this.subMessages();
    });
  }

  /**
 * Subscribes to the messages within the "Channels" collection in Firestore.
 * Queries up to 1000 channels and updates the `channel` array with channel data.
 * After updating, it calls `getSelectedChannel()` to ensure the current channel is set.
 */
  subMessages() {
    const q = query(collection(this.firestore, 'Channels'), limit(1000));
    onSnapshot(q, (list) => {
      this.channel = [];
      list.forEach((element) => {
        this.channel.push(this.setNoteChannel(element.data(), element.id));
      });
      this.getSelectedChannel();
    });
  }

  /**
 * Formats channel data into a structured object.
 * 
 * @param obj - The Firestore data object for the channel.
 * @param id - The unique identifier of the channel.
 * @returns An object representing the channel with default values for any missing fields.
 */
  setNoteChannel(obj: any, id: string) {
    return {
      id: id,
      channelCreatorUid: obj.channelCreatorUid || '',
      channelCreatorName: obj.channelCreatorName || '',
      creationsDate: obj.creationsDate || '',
      description: obj.description || '',
      images: obj.images || '',
      name: obj.name || '',
      uids: obj.uids || '',
    };
  }

  /**
 * Finds and sets the currently selected channel data.
 * 
 * Iterates through the channel list to locate the channel that matches
 * the current channel ID, and assigns it to `selectetChannelData`.
 */
  getSelectedChannel() {
    for (let i = 0; i < this.channel.length; i++) {
      const element = this.channel[i];
      if (element.id == this.currentChannel) {
        this.selectetChannelData = element;
        this.originalChannelData = element;
      }
    }
  }

  /**
 * Validates the channel name input.
 * 
 * Checks if the `channelName` has at least 3 characters to ensure 
 * it meets the minimum length requirement.
 * 
 * @returns `true` if the input is valid, otherwise `false`.
 */
  isInputValid(): boolean {
    return this.channelName.length >= 3;
  }

  /**
 * Navigates to the previous channel in the list.
 * 
 * This function resets relevant services and sets the selected channel
 * to the previous channel in the list by calculating the reverse index
 * of the current channel. It then updates channel and user information.
 */
  navigateToPreviousChannel() {
    this.openTheNextChannel();
    this.editChannelService.setEditChannel(false, null);
    this.threadService.closeThread();
    this.channelSelectionService.openChannel();
    this.channelSelectionService.setSelectedChannel('wXzgNEb34DReQq3fEsAo7VTcXXNA');
    // const reverseIndex =
    //   this.channelInfo.AllChannelsIds.length -
    //   1 -
    //   this.channelInfo.currentChannelNumber;
    // this.channelSelectionService.setSelectedChannel(
    //   this.channelInfo.AllChannelsIds[reverseIndex]
    // );
    // this.channelInfo.fetchChannels();
    // this.channelInfo.fetchUsers();
    // this.channelInfo.currentChannelNumber = reverseIndex;
  }

  /**
 * Deletes a user from the specified channel data and updates the Firestore document.
 * 
 * This function removes the user data from the provided `channelData` arrays at the given 
 * `userNumber` index, then updates the Firestore document with the modified data. 
 * After updating, it navigates to the previous channel.
 *
 * @param channelData - The current data of the channel, including user lists.
 * @param userNumber - The index of the user to delete in the channel data arrays.
 * @param docSnapshot - The Firestore document snapshot containing the channel ID.
 */
  async deleteUserFromChannel(
    channelData: any,
    userNumber: any,
    docSnapshot: any
  ) {
    channelData['uids'].splice(userNumber, 1);
    channelData['emails'].splice(userNumber, 1);
    channelData['images'].splice(userNumber, 1);
    channelData['users'].splice(userNumber, 1);
    const channelDocRef = doc(this.firestore, 'Channels', docSnapshot.id);
    await updateDoc(channelDocRef, {
      uids: channelData['uids'],
      emails: channelData['emails'],
      images: channelData['images'],
      users: channelData['users'],
    });
    this.navigateToPreviousChannel();
  }

  /**
 * Checks if the current user is a member of the selected channel, and if so, removes them from the channel.
 * 
 * This function retrieves all channel documents from Firestore, and for each document, it checks 
 * if the channel ID matches the selected channel ID. If a match is found, the function checks if 
 * the current user is a member of that channel by locating their UID in the channel's `uids` array. 
 * If the user is a member, they are removed from the channel; otherwise, an alert notifies 
 * that the user is not a member.
 */
  async abandon() {
    const channelsCollection = collection(this.firestore, 'Channels');
    const querySnapshot = await getDocs(channelsCollection);
    querySnapshot.forEach(async (docSnapshot) => {
      const channelData = docSnapshot.data();
      if (channelData['id'] === this.selectetChannelData.id) {
        const userNumber = channelData['uids'].indexOf(
          this.authService.currentUserSignal()?.uId
        );
        if (userNumber > -1) {
          this.deleteUserFromChannel(channelData, userNumber, docSnapshot);
        } else {
          
        }
      }
    });
  }

  /**
 * Opens the next channel in the list by incrementing the current channel index.
 * 
 * This function checks if the current channel number is less than the total number 
 * of channels minus one. If it is, the function increments the current channel number 
 * by one to switch to the next channel. If the current channel number is at the last 
 * channel, it wraps around and resets the current channel number to zero, thereby 
 * cycling back to the first channel in the list.
 */
  openTheNextChannel() {
    if (
      this.channelInfo.currentChannelNumber <
      this.channelInfo.AllChannelsIds.length - 1
    ) {
      this.channelInfo.currentChannelNumber =
        this.channelInfo.currentChannelNumber + 1;
    } else {
      this.channelInfo.currentChannelNumber = 0;
    }
  }

  /**
 * Opens the channel name editing interface.
 * 
 * This function sets the `editChannelNameOpen` property to `true`, indicating 
 * that the editing UI for the channel name should be displayed. This is typically 
 * called when the user wishes to change the name of the channel.
 */
  editChannelName() {
    this.editChannelNameOpen = true;
  }

  /**
 * Opens the channel description editing interface.
 * 
 * This function sets the `editChannelDescriptionOpen` property to `true`, indicating 
 * that the editing UI for the channel description should be displayed. This is typically 
 * called when the user wishes to change the description of the channel.
 */
  editChannelDescription() {
    this.editChannelDescriptionOpen = true;
  }

  /**
 * Saves the updated channel name to the Firestore database.
 * 
 * This asynchronous function first checks if the `channelName` property is 
 * not empty. If it is empty, an error message is logged, and the function exits.
 * If the channel name is valid, it retrieves a reference to the current channel 
 * document in the Firestore 'Channels' collection and attempts to update it 
 * with the new channel name (converted to JSON format via the `toJSON()` method).
 * If the update is successful, the channel editor UI is closed; otherwise, 
 * an error message is logged to the console.
 */
  async saveChannelName() {
    if (!this.originalChannelData.name) {
      return;
    }
    const channelRef = doc(
      collection(this.firestore, 'Channels'),
      this.currentChannel
    );
    try {
      await updateDoc(channelRef, this.toJSON());
      this.closeChannelEditor();
    } catch (err) {
    }
  }

  /**
 * Closes the channel editor UI and resets relevant properties.
 * 
 * This function resets the `channelName` property to an empty string and sets
 * `editChannelNameOpen` to false, effectively closing the channel editor UI.
 * It also invokes the `closeThread()` method from the `threadService` to close 
 * any active threads and reopens the current channel using the 
 * `openChannel()` method from the `channelSelectionService`. Finally, it 
 * updates the selected channel to reflect the current channel in the channel 
 * info by calling `setSelectedChannel()` with the appropriate channel ID.
 */
  closeChannelEditor() {
    this.channelName = '';
    this.editChannelNameOpen = false;
    this.threadService.closeThread();
    this.channelSelectionService.openChannel();
    this.channelSelectionService.setSelectedChannel(
      this.channelInfo.AllChannelsIds[this.channelInfo.currentChannelNumber]
    );
  }

  /*
 * Converts the channel data to a JSON format.
 * 
 * This method returns an object representing the channel, 
 * specifically including the `name` of the channel. This 
 * JSON representation can be useful for various operations, 
 * such as saving the channel data to a database or sending 
 * it over a network.
 * 
 * @returns {Object} An object containing the channel's name.
 */
  toJSON() {
    return {
      name: this.originalChannelData.name,
    };
  }

  /**
 * Closes the channel description editor and resets the description field.
 * 
 * This method clears the current channel description and updates the state 
 * to indicate that the channel description editor is closed. It also 
 * ensures that the current thread is closed and the correct channel is 
 * opened in the channel selection service.
 */
  closeChannelDescriptionEdit() {
    this.channelDescription = '';
    this.editChannelDescriptionOpen = false;
    this.threadService.closeThread();
    this.channelSelectionService.openChannel();
    this.channelSelectionService.setSelectedChannel(
      this.channelInfo.AllChannelsIds[this.channelInfo.currentChannelNumber]
    );
  }

  /**
 * Closes the channel description editor and resets the description field.
 * 
 * This method clears the current channel description and updates the state 
 * to indicate that the channel description editor is closed. It also 
 * ensures that the current thread is closed and the correct channel is 
 * opened in the channel selection service.
 */
  async saveChannelDescription() {
    if (!this.originalChannelData.description) {

      return;
    }
    const channelRef = doc(
      collection(this.firestore, 'Channels'),
      this.currentChannel
    );
    try {
      await updateDoc(channelRef, this.toJSONDescription());
      this.closeChannelDescriptionEdit();
    } catch (err) {
    }
  }

  /*
 * Converts the channel description into a JSON format for storage.
 * 
 * This method creates and returns an object containing the current 
 * channel description. It is typically used when updating the 
 * channel's description in the Firestore database.
 * 
 * @returns {Object} An object representing the channel description.
 */
  toJSONDescription() {
    return {
      description: this.originalChannelData.description,
    };
  }

  /**
 * Opens the user profile for the selected user.
 * 
 * This method updates the channel information to display the 
 * profile of a user identified by the index `i`. It sets the 
 * profile view to open and stores the relevant user details 
 * such as active user, email, image, and UID based on the 
 * current channel number.
 * 
 * @param {number} i - The index of the user in the channels' user list.
 */
  openUserProfil(i: number) {
    this.channelInfo.userProfilOpen = true;
    this.channelInfo.activeUserProfil = i;
    this.channelInfo.activeUser =
      this.channelInfo.AllChannelsUsers[this.channelInfo.currentChannelNumber][
        i
      ];
    this.channelInfo.activeEmail =
      this.channelInfo.AllChannelsEmails[this.channelInfo.currentChannelNumber][
        i
      ];
    this.channelInfo.activeImage =
      this.channelInfo.AllChannelsImages[this.channelInfo.currentChannelNumber][
        i
      ];
    this.channelInfo.activeUid =
      this.channelInfo.GlobalChannelUids[this.channelInfo.currentChannelNumber][
        i
      ];
  }
}

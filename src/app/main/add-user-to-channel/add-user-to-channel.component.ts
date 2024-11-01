import { Component, inject } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { collection, doc, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { ChannelSelectionService } from '../../services/channel-selection.service';
import { ThreadService } from '../../services/thread.service';

@Component({
  selector: 'app-add-user-to-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-user-to-channel.component.html',
  styleUrl: './add-user-to-channel.component.scss'
})
export class AddUserToChannelComponent {
  hideOrShowSidebar = inject(SidebarService);
  authService = inject(AuthService);
  activeUserIndex: number | null = null;
  filteredUserList: string[] = this.hideOrShowSidebar.userList;
  filteredImageList: string[] = this.hideOrShowSidebar.imageList;
  filteredUidList: string[] = this.hideOrShowSidebar.uidList;
  filteredEmailList: string[] = this.hideOrShowSidebar.emailList;
  searchTerm: string = '';
  result = '';
  addUserEnabled = false;

  constructor(private firestore: Firestore,
    private channelSelectionService: ChannelSelectionService,
    private threadService: ThreadService,
  ) { }

  /**
 * Filters the user list based on the search input, updating the filtered list with users 
 * who match the search term and are not already in the current channel or selected.
 *
 * @param {Event} event - The input event triggered by the user's search action.
 *
 * @description
 * - Converts the search term to lowercase for case-insensitive matching.
 * - Clears existing filters.
 * - Filters users by checking:
 *   - The user name includes the search term.
 *   - The user is not in the current channel (`GlobalChannelUids`).
 *   - The user is not in the selected users list (`selectedUids`).
 * - If no search term is entered, clears all filters.
 */
  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    if (this.searchTerm) {
      this.clearFilteredLists();
      this.hideOrShowSidebar.userList.forEach((user, index) => {
        const uid = this.hideOrShowSidebar.uidList[index];
        const isUidInChannel = this.hideOrShowSidebar.GlobalChannelUids[this.hideOrShowSidebar.currentChannelNumber].includes(uid);
        const isUserAlreadySelected = this.hideOrShowSidebar.selectedUids.includes(uid);
        if (user.toLowerCase().includes(this.searchTerm) && !isUidInChannel && !isUserAlreadySelected) {
          this.pushToFilteredLists(user, index, uid);
        }
      });
    } else {
      this.clearFilteredLists();
    }
  }

  /**
 * Adds a user and associated data (image, UID, and email) to the filtered lists.
 *
 * @param {any} user - The user to add to the filtered list.
 * @param {any} index - The index of the user in the original lists.
 * @param {any} uid - The unique identifier of the user.
 *
 * @description
 * - Pushes the user to `filteredUserList`.
 * - Adds the user's image from `imageList` to `filteredImageList`.
 * - Adds the user's UID to `filteredUidList`.
 * - Adds the user's email from `emailList` to `filteredEmailList`.
 */
  pushToFilteredLists(user: any, index: any, uid: any) {
    this.filteredUserList.push(user);
    this.filteredImageList.push(this.hideOrShowSidebar.imageList[index]);
    this.filteredUidList.push(uid);
    this.filteredEmailList.push(this.hideOrShowSidebar.emailList[index]);
  }

  /**
 * Clears all filtered lists by resetting them to empty arrays.
 *
 * @description
 * - Resets `filteredUserList`, `filteredImageList`, `filteredUidList`, and `filteredEmailList` to empty arrays.
 */
  clearFilteredLists() {
    this.filteredUserList = [];
    this.filteredImageList = [];
    this.filteredUidList = [];
    this.filteredEmailList = [];
  }

  /**
 * Deletes a user and their associated data from all filtered lists at a specified index.
 *
 * @param {number} i - The index of the user to be removed from the filtered lists.
 *
 * @description
 * - Removes the user, image, UID, and email at index `i` from `filteredUserList`, `filteredImageList`, 
 *   `filteredUidList`, and `filteredEmailList`.
 */
  deleteFilteredUser(i: number) {
    this.filteredUserList.splice(i, 1);
    this.filteredImageList.splice(i, 1);
    this.filteredUidList.splice(i, 1);
    this.filteredEmailList.splice(i, 1);
  }

  /**
 * Adds a user and their associated data from the filtered lists to the selected lists.
 *
 * @param {number} i - The index of the user in the filtered lists.
 * @param {any} selectedUid - The unique identifier of the selected user.
 *
 * @description
 * - Adds the user, image, UID, and email at index `i` from the filtered lists 
 *   to `selectedUsers`, `selectedImages`, `selectedUids`, and `selectedEmails`.
 */
  addToSelectedUsers(i: number, selectedUid: any) {
    this.hideOrShowSidebar.selectedUsers.push(this.filteredUserList[i]);
    this.hideOrShowSidebar.selectedImages.push(this.filteredImageList[i]);
    this.hideOrShowSidebar.selectedUids.push(selectedUid);
    this.hideOrShowSidebar.selectedEmails.push(this.filteredEmailList[i]);
  }

  /**
 * Selects a user from the filtered lists and adds them to the selected lists if not already selected.
 *
 * @param {number} i - The index of the user in the filtered lists.
 *
 * @description
 * - Checks if the user’s UID is already in `selectedUids`.
 * - If not, calls `addToSelectedUsers` to add the user to the selected lists.
 * - Calls `deleteFilteredUser` to remove the user from the filtered lists.
 * - Clears all filters and resets the search term.
 * - Updates `addUserEnabled` to `true` if there are selected users.
 */
  selectUser(i: number) {
    const selectedUid = this.filteredUidList[i];
    if (!this.hideOrShowSidebar.selectedUids.includes(selectedUid)) {
      this.addToSelectedUsers(i, selectedUid)
      this.deleteFilteredUser(i);
      this.clearFilteredLists();
      this.searchTerm = '';
    }
    this.addUserEnabled = this.hideOrShowSidebar.selectedUsers.length > 0;
  }

  /**
 * Clears all selected lists by resetting them to empty arrays.
 *
 * @description
 * - Resets `selectedUsers`, `selectedImages`, `selectedUids`, and `selectedEmails` to empty arrays.
 */
  clearSelectedLists() {
    this.hideOrShowSidebar.selectedUsers = [];
    this.hideOrShowSidebar.selectedImages = [];
    this.hideOrShowSidebar.selectedUids = [];
    this.hideOrShowSidebar.selectedEmails = [];
  }

  /**
   * Prevents the dialog from closing by stopping event propagation.
   *
   * @param {Event} e - The event object to stop from propagating.
   *
   * @description
   * - Calls `stopPropagation` on the event to prevent it from triggering any parent event handlers.
   */
  notCloseDialog(e: any) {
    e.stopPropagation(e);
  }

  /**
 * Closes the user addition dialog and resets related states.
 *
 * @description
 * - Sets `addUserFromHeaderToChannelOpen` to false to close the dialog.
 * - Clears the filtered and selected user lists.
 * - Resets the search term to an empty string.
 */
  closeDialogAddUser() {
    this.hideOrShowSidebar.addUserFromHeaderToChannelOpen = false;
    this.clearFilteredLists();
    this.clearSelectedLists();
    this.searchTerm = '';
  }

  /**
   * Prevents the dialog from closing by stopping event propagation.
   *
   * @param {Event} e - The event object to stop from propagating.
   *
   * @description
   * - Calls `stopPropagation` on the event to prevent it from triggering any parent event handlers.
   */
  notCloseDialogAddUser(e: any) {
    e.stopPropagation(e);
  }

  get realChannelIndex() {
    return this.hideOrShowSidebar.AllChannelsIds.length - 1 - this.hideOrShowSidebar.activeChannelIndex;
  }

  /**
 * Saves the selected users to the current channel in Firestore.
 *
 * @async
 * @description
 * - Calculates the channel ID based on the current channel number.
 * - Retrieves the channel document from Firestore.
 * - Calls `updateChannelAndResetUser` to update the channel with the selected users.
 * - Logs an error message if there is an issue during the data saving process.
 */
  async saveUsers() {
    const channelId = this.hideOrShowSidebar.AllChannelsIds[this.realChannelIndex];
    const channelRef = doc(collection(this.firestore, 'Channels'), channelId);
    try {
      const channelDoc = await getDoc(channelRef);
      await this.updateChannelAndResetUser(channelDoc, channelRef); 
    } catch (error) {
      console.error('Fehler beim Speichern der Daten:', error);
    }
  }

  /**
 * Updates the channel document with the selected users and resets the user selection.
 *
 * @async
 * @param {any} channelDoc - The document snapshot of the channel retrieved from Firestore.
 * @param {any} channelRef - A reference to the channel document in Firestore.
 *
 * @description
 * - Checks if the channel document exists; if so, it retrieves the existing data.
 * - Merges the current users, images, UIDs, and emails from the channel with the selected users.
 * - Updates the channel document in Firestore with the new data.
 * - Calls `clearUserAndResetChannel` to reset the user selection and channel state after updating.
 */
  async updateChannelAndResetUser(channelDoc: any, channelRef: any) {
    if (channelDoc.exists()) {
      const channelData = channelDoc.data();
      const updatedUsers = [...(channelData['users'] || []), ...this.hideOrShowSidebar.selectedUsers];
      const updatedImages = [...(channelData['images'] || []), ...this.hideOrShowSidebar.selectedImages];
      const updatedUids = [...(channelData['uids'] || []), ...this.hideOrShowSidebar.selectedUids];
      const updatedEmails = [...(channelData['emails'] || []), ...this.hideOrShowSidebar.selectedEmails];
  
      this.channelSelectionService.blockUpdatesTemporarily();
  
      await updateDoc(channelRef, {
        users: updatedUsers,
        images: updatedImages,
        uids: updatedUids,
        emails: updatedEmails
      });
  
      this.clearUserAndResetChannel();
    }
  }
  

  /**
 * Resets the user selection and updates the current channel state.
 *
 * @description
 * - Clears the selected user lists and resets related states.
 * - Disables the user addition feature.
 * - Resets the search term to an empty string.
 * - Closes the user addition dialog.
 * - Closes the current thread.
 * - Opens the channel selection interface.
 * - Updates the selected channel based on the current channel number.
 */
  clearUserAndResetChannel() {
    this.clearSelectedLists();
    this.addUserEnabled = false;
    this.searchTerm = '';
    this.closeDialogAddUser();
    this.threadService.closeThread();
    this.channelSelectionService.setSelectedChannel(this.hideOrShowSidebar.AllChannelsIds[this.realChannelIndex]);
  }

  /**
 * Sets the active user index and displays it in an alert.
 *
 * @param {number} i - The index of the active user.
 *
 * @description
 * - Updates `activeUserIndex` with the provided index.
 * - Displays an alert showing the current active user index.
 */
  userActive(i: number) {
    this.activeUserIndex = i;
    alert(this.activeUserIndex);
  }

  /**
 * Deletes a user from the selected users and updates the user selection state.
 *
 * @param {number} i - The index of the user to be deleted.
 *
 * @description
 * - Calls `removeSelectedUserData` to remove the user at the specified index.
 * - Updates `addUserEnabled` based on whether there are remaining selected users.
 * - Resets the search term to an empty string.
 * - Clears the filtered user lists.
 */
  deleteUser(i: number) {
    this.removeSelectedUserData(i);
    if (this.hideOrShowSidebar.selectedUsers.length > 0) {
      this.addUserEnabled = true;
    } else {
      this.addUserEnabled = false;
    }
    this.searchTerm = '';
    this.clearFilteredLists();
  }

  /**
 * Removes the selected user and their associated data from the selected lists.
 *
 * @param {number} i - The index of the user to be removed.
 *
 * @description
 * - Removes the user, image, UID, and email at the specified index `i` 
 *   from `selectedUsers`, `selectedImages`, `selectedUids`, and `selectedEmails`.
 */
  removeSelectedUserData(i: number) {
    this.hideOrShowSidebar.selectedUsers.splice(i, 1);
    this.hideOrShowSidebar.selectedImages.splice(i, 1);
    this.hideOrShowSidebar.selectedUids.splice(i, 1);
    this.hideOrShowSidebar.selectedEmails.splice(i, 1);
  }
}

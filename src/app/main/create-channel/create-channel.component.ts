import { Component, inject } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, setDoc, doc } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { ChannelSelectionService } from '../../services/channel-selection.service';
import { ThreadService } from '../../services/thread.service';

@Component({
  selector: 'app-create-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-channel.component.html',
  styleUrls: ['./create-channel.component.scss', './create-channel-responsive.component.scss']
})

export class CreateChannelComponent {
  hideOrShowSidebar = inject(SidebarService);
  authService = inject(AuthService);
  newChannel = {
    name: '',
    id: '',
    description: '',
    users: [],
    uids: [],
    emails: [],
    images: [],
    channelCreatorName: '',
    channelCreatorUid: '',
    creationsDate: 0
  };
  loading = false;
  activeUserIndex: number | null = null;
  filteredUserList: string[] = this.hideOrShowSidebar.userList;
  filteredImageList: string[] = this.hideOrShowSidebar.imageList;
  filteredUidList: string[] = this.hideOrShowSidebar.uidList;
  filteredEmailList: string[] = this.hideOrShowSidebar.emailList;
  searchTerm: string = '';
  result = '';
  nameIsTaken: boolean = false;

  constructor(private firestore: Firestore,
    private channelSelectionService: ChannelSelectionService,
    private threadService: ThreadService,
  ) { }

  /**
 * Checks if the new channel name is valid by verifying if it is already taken.
 *
 * @void
 *
 * @description
 * - Sets `nameIsTaken` to true if the `newChannel.name` already exists in 
 *   `AllChannels`; otherwise, sets it to false.
 * - Logs the value of `nameIsTaken` to the console.
 */
  isNameValid() {
    if (this.hideOrShowSidebar.AllChannels.includes(this.newChannel.name)) {
      this.nameIsTaken = true;
    } else {
      this.nameIsTaken = false;
    }
  }

  /**
 * Validates the input for the new channel name.
 *
 * @returns {boolean} True if the channel name is valid (length >= 3); 
 *                    otherwise, false.
 *
 * @description
 * - Checks if the length of `newChannel.name` is at least 3 characters.
 */
  isInputValid(): boolean {
    return this.newChannel.name.length >= 3;
  }

  /**
 * Handles the search functionality for filtering user lists.
 *
 * @param {any} event - The event object triggered by the search input.
 * @void
 *
 * @description
 * - Updates `searchTerm` with the lowercased value from the search input.
 * - If `searchTerm` is not empty, clears the filtered lists and filters 
 *   the user list and details. Otherwise, clears the filtered lists.
 */
  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    if (this.searchTerm) {
      this.clearFilteredLists();
      this.filterUserListAndDetails();
    } else {
      this.clearFilteredLists();
    }
  }

  /**
 * Filters the user list and associated details based on the current search term.
 *
 * @void
 *
 * @description
 * - Iterates through `hideOrShowSidebar.userList` and checks if each user's name 
 *   includes the `searchTerm` (case insensitive).
 * - If a match is found, adds the user and their corresponding details 
 *   (image, UID, and email) to the respective filtered lists.
 */
  filterUserListAndDetails() {
    this.hideOrShowSidebar.userList.forEach((user, index) => {
      if (user.toLowerCase().includes(this.searchTerm)) {
        this.filteredUserList.push(user);
        this.filteredImageList.push(this.hideOrShowSidebar.imageList[index]);
        this.filteredUidList.push(this.hideOrShowSidebar.uidList[index]);
        this.filteredEmailList.push(this.hideOrShowSidebar.emailList[index]);
      }
    });
  }

  /**
 * Clears all filtered lists by resetting them to empty arrays.
 *
 * @void
 *
 * @description
 * - Empties `filteredUserList`, `filteredImageList`, `filteredUidList`, 
 *   and `filteredEmailList` to remove any previous search results.
 */
  clearFilteredLists() {
    this.filteredUserList = [];
    this.filteredImageList = [];
    this.filteredUidList = [];
    this.filteredEmailList = [];
  }

  /**
 * Clears all selected user data by resetting the lists to empty arrays.
 *
 * @void
 *
 * @description
 * - Empties `hideOrShowSidebar.selectedUsers`, `hideOrShowSidebar.selectedImages`, 
 *   `hideOrShowSidebar.selectedUids`, and `hideOrShowSidebar.selectedEmails` 
 *   to remove any previously selected user information.
 */
  clearSelectedLists() {
    this.hideOrShowSidebar.selectedUsers = [];
    this.hideOrShowSidebar.selectedImages = [];
    this.hideOrShowSidebar.selectedUids = [];
    this.hideOrShowSidebar.selectedEmails = [];
  }

  /**
 * Closes the channel creation dialog and resets related data.
 *
 * @void
 *
 * @description
 * - Sets `hideOrShowSidebar.createChannelDialogActive` to false to hide the dialog.
 * - Calls `clearFilteredLists` and `clearSelectedLists` to reset the filtered and selected user lists.
 * - Clears the `searchTerm`, `newChannel.name`, and `newChannel.description` fields.
 */
  closeDialog() {
    this.hideOrShowSidebar.createChannelDialogActive = false;
    this.clearFilteredLists();
    this.clearSelectedLists();
    this.searchTerm = '';
    this.newChannel.name = '';
    this.newChannel.description = '';
  }

  /**
 * Prevents the dialog from closing when an event is triggered.
 *
 * @param {Event} e - The event object that triggered the function.
 *
 * @description
 * - Calls `stopPropagation` on the event to prevent the event from bubbling up 
 *   to parent elements, which would normally cause the dialog to close.
 */
  notCloseDialog(e: any) {
    e.stopPropagation(e);
  }

  /**
 * Activates the functionality to add selected users to the channel.
 *
 * @description
 * - Sets `addAllUsersToChannel` to `false` to indicate that not all users 
 *   are being added.
 * - Sets `addSelectedUsersToChannel` to `true` to enable the addition 
 *   of the currently selected users to the channel.
 */
  addSelectedUser() {
    this.hideOrShowSidebar.addAllUsersToChannel = false;
    this.hideOrShowSidebar.addSelectedUsersToChannel = true;
  }

  /**
 * Activates the functionality to add all users to the channel.
 *
 * @description
 * - Sets `addAllUsersToChannel` to `true` to indicate that all users 
 *   are being added to the channel.
 * - Sets `addSelectedUsersToChannel` to `false` to disable the addition 
 *   of only selected users.
 */
  addAllUser() {
    this.hideOrShowSidebar.addAllUsersToChannel = true;
    this.hideOrShowSidebar.addSelectedUsersToChannel = false;
  }

  /**
 * Closes the dialog for adding a user to the channel and resets the state.
 *
 * @description
 * - Sets `addUserToChannelOpen` to `false` to close the dialog.
 * - Clears any filtered user lists.
 * - Clears selected user lists.
 * - Resets the search term and the new channel name and description to empty strings.
 */
  closeDialogAddUser() {
    this.hideOrShowSidebar.addUserToChanelOpen = false;
    this.clearFilteredLists();
    this.clearSelectedLists();
    this.searchTerm = '';
    this.newChannel.name = '';
    this.newChannel.description = '';
  }

  /**
* Prevents the dialog from closing when an event is triggered.
*
* @param {Event} e - The event object that triggered the function.
*
* @description
* - Calls `stopPropagation` on the event to prevent the event from bubbling up 
*   to parent elements, which would normally cause the dialog to close.
*/
  notCloseDialogAddUser(e: any) {
    e.stopPropagation(e);
  }

  /**
 * Initiates the process to create a new channel.
 *
 * @description
 * - Sets `addUserToChannelOpen` to `true` to open the dialog for adding users to the new channel.
 * - Sets `createChannelDialogActive` to `false` to close the channel creation dialog.
 */
  createChannel() {
    this.hideOrShowSidebar.addUserToChanelOpen = true;
    this.hideOrShowSidebar.createChannelDialogActive = false;
  }

  /**
 * Generates a random alphanumeric ID of a specified length.
 *
 * @param {number} [length=28] - The length of the ID to be generated. Defaults to 28.
 * @returns {string} - A randomly generated alphanumeric ID.
 *
 * @description
 * - The function constructs an ID using uppercase letters, lowercase letters, and digits.
 * - It concatenates random characters from the defined set until the desired length is reached.
 */
  generateId(length: number = 28): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 28; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      this.result += characters[randomIndex];
    }
    return this.result;
  }

  /*
 * Asynchronously saves a new channel to the Firestore database.
 *
 * @async
 * @returns {Promise<void>} - A promise that resolves when the channel is saved.
 *
 * @description
 * - Sets the loading state to true during the save process.
 * - Generates a new document reference in the 'Channels' collection using a unique ID.
 * - Saves the channel data in Firestore using the `setDoc` method.
 * - If the operation is successful, it:
 *   - Sets the loading state to false.
 *   - Clears the new channel fields.
 *   - Clears the selected user lists.
 *   - Resets user data lists.
 *   - Restores sidebar lists to their original state.
 *   - Closes the "Add User" dialog.
 *   - Opens the newly created channel.
 * - If an error occurs, it logs the error to the console.
 */
  async saveChannel() {
    if (this.hideOrShowSidebar.selectedUsers.length > 0 || this.hideOrShowSidebar.addAllUsersToChannel){
      this.loading = true;
    const channelRef = doc(
      collection(this.firestore, 'Channels'),
      this.generateId()
    );
    await setDoc(channelRef, this.toJSON())
      .catch((err) => {
        console.error(err);
      })
      .then(() => {
        this.loading = false;
        this.clearNewChannelFields();
        this.clearSelectedLists();
        this.resetUserDataLists();
        this.restoreSidebarLists();
        this.closeDialogAddUser();
        this.openChannel(this.result);
        this.result = '';
      });
    }else{
      alert('Bitte mindestens 1 Mitglieder auswählen!');
    }
  }

  /*
 * Restores the sidebar lists to their original state by resetting them 
 * to the complete lists of users, images, UIDs, and emails.
 *
 * @returns {void}
 *
 * @description
 * This function sets the following properties in the `hideOrShowSidebar` 
 * object to their corresponding original lists:
 * - `userList` is set to `AllUsers`.
 * - `imageList` is set to `AllImages`.
 * - `uidList` is set to `AllUids`.
 * - `emailList` is set to `AllEmails`.
 */
  restoreSidebarLists() {
    this.hideOrShowSidebar.userList = this.hideOrShowSidebar.AllUsers;
    this.hideOrShowSidebar.imageList = this.hideOrShowSidebar.AllImages;
    this.hideOrShowSidebar.uidList = this.hideOrShowSidebar.AllUids;
    this.hideOrShowSidebar.emailList = this.hideOrShowSidebar.AllEmails;
  }

  /*
 * Resets the user data lists in the sidebar by clearing the existing 
 * lists of users, images, UIDs, and emails.
 *
 * @returns {void}
 *
 * @description
 * This function sets the following properties in the `hideOrShowSidebar` 
 * object to empty arrays:
 * - `userList` is reset to an empty array.
 * - `imageList` is reset to an empty array.
 * - `uidList` is reset to an empty array.
 * - `emailList` is reset to an empty array.
 */
  resetUserDataLists() {
    this.hideOrShowSidebar.userList = [];
    this.hideOrShowSidebar.imageList = [];
    this.hideOrShowSidebar.uidList = [];
    this.hideOrShowSidebar.emailList = [];
  }

  /*
 * Clears the fields of the new channel object by resetting its properties 
 * to their initial values.
 *
 * @returns {void}
 *
 * @description
 * This function sets the following properties of the `newChannel` object 
 * to their default values:
 * - `name` is reset to an empty string.
 * - `id` is reset to an empty string.
 * - `description` is reset to an empty string.
 * - `channelCreatorName` is reset to an empty string.
 * - `channelCreatorUid` is reset to an empty string.
 * - `creationsDate` is reset to 0.
 * - `users` is reset to an empty array.
 * - `emails` is reset to an empty array.
 */
  clearNewChannelFields() {
    this.newChannel.name = '',
      this.newChannel.id = '',
      this.newChannel.description = '',
      this.newChannel.channelCreatorName = '';
    this.newChannel.channelCreatorUid = '';
    this.newChannel.creationsDate = 0;
    this.newChannel.users = [];
    this.newChannel.emails = [];
  }

  /*
 * Constructs and returns a channel object with user details and metadata.
 *
 * @returns {Object} The channel object containing the following properties:
 * - `name`: The name of the channel.
 * - `id`: The generated ID for the channel.
 * - `description`: The description of the channel.
 * - `users`: An array of users added to the channel.
 * - `uids`: An array of user IDs corresponding to the users added to the channel.
 * - `emails`: An array of email addresses corresponding to the users.
 * - `images`: An array of images associated with the users.
 * - `channelCreatorName`: The name of the user creating the channel, defaults to 'Gast' if not found.
 * - `channelCreatorUid`: The UID of the user creating the channel, defaults to 'Gast' if not found.
 * - `creationsDate`: The timestamp of when the channel was created.
 *
 * @description
 * This function checks if all users are to be added to the channel and 
 * constructs an object that represents the channel's properties, 
 * utilizing data from the `newChannel` object and the `hideOrShowSidebar` 
 * user lists. The creator's name and UID are fetched from the 
 * authentication service, with a fallback to 'Gast' if not available.
 */
  ifAddAllUsersToChannel() {
    return {
      name: this.newChannel.name,
      id: this.result,
      description: this.newChannel.description,
      users: this.hideOrShowSidebar.userList,
      uids: this.hideOrShowSidebar.uidList,
      emails: this.hideOrShowSidebar.emailList,
      images: this.hideOrShowSidebar.imageList,
      channelCreatorName: this.newChannel.channelCreatorName = this.authService.currentUserSignal()?.name || 'Gast',
      channelCreatorUid: this.newChannel.channelCreatorUid = this.authService.currentUserSignal()?.uId || 'Gast',
      creationsDate: this.newChannel.creationsDate = new Date().getTime()
    };
  }

  /*
 * Constructs and returns a channel object with details of selected users and metadata.
 *
 * @returns {Object} The channel object containing the following properties:
 * - `name`: The name of the channel.
 * - `id`: The generated ID for the channel.
 * - `description`: The description of the channel.
 * - `users`: An array of selected users to be added to the channel.
 * - `uids`: An array of user IDs corresponding to the selected users.
 * - `emails`: An array of email addresses corresponding to the selected users.
 * - `images`: An array of images associated with the selected users.
 * - `channelCreatorName`: The name of the user creating the channel, defaults to 'Gast' if not found.
 * - `channelCreatorUid`: The UID of the user creating the channel, defaults to 'Gast' if not found.
 * - `creationsDate`: The timestamp of when the channel was created.
 *
 * @description
 * This function checks if only selected users are to be added to the channel and 
 * constructs an object representing the channel's properties, 
 * utilizing data from the `newChannel` object and the `hideOrShowSidebar` 
 * selected user lists. The creator's name and UID are fetched from the 
 * authentication service, with a fallback to 'Gast' if not available.
 */
  ifAddSelectedUsersToChannel() {
    return {
      name: this.newChannel.name,
      id: this.result,
      description: this.newChannel.description,
      users: this.hideOrShowSidebar.selectedUsers,
      uids: this.hideOrShowSidebar.selectedUids,
      emails: this.hideOrShowSidebar.selectedEmails,
      images: this.hideOrShowSidebar.selectedImages,
      channelCreatorName: this.newChannel.channelCreatorName = this.authService.currentUserSignal()?.name || 'Gast',
      channelCreatorUid: this.newChannel.channelCreatorUid = this.authService.currentUserSignal()?.uId || 'Gast',
      creationsDate: this.newChannel.creationsDate = new Date().getTime()
    };
  }

  /*
 * Converts the channel data into a JSON-compatible format.
 *
 * @returns {Object} A JSON object representing the channel, containing:
 * - User details and metadata for either all users or selected users, depending on the context.
 *
 * @description
 * This function checks the state of `addAllUsersToChannel` in the 
 * `hideOrShowSidebar` object to determine whether to include all users 
 * or only the selected users in the returned channel object. 
 * It calls `ifAddAllUsersToChannel` or `ifAddSelectedUsersToChannel` 
 * accordingly, ensuring that the appropriate user data is included 
 * in the JSON representation of the channel.
 */
  toJSON() {
    if (this.hideOrShowSidebar.addAllUsersToChannel) {
      return this.ifAddAllUsersToChannel();
    } else {
      return this.ifAddSelectedUsersToChannel();
    }
  }

  /**
 * Opens a channel based on the provided channel ID.
 *
 * @param {any} result - The ID of the channel to be opened.
 *
 * @description
 * This function iterates through the list of all channel IDs stored 
 * in `hideOrShowSidebar.AllChannelsIds`. If it finds a match between 
 * the given `result` (channel ID) and an ID in the list, it calls 
 * the `openChannel` method from `hideOrShowSidebar`, passing the 
 * index of the matched channel. This effectively opens the specified 
 * channel for the user.
 */
  openChannel(result: any) {
    for (let i = 0; i < this.hideOrShowSidebar.AllChannelsIds.length; i++) {
      const channelId = this.hideOrShowSidebar.AllChannelsIds[i];
      if (channelId == result) {
        this.hideOrShowSidebar.openChannel(i);
      }
    }
  }

  /**
 * Sets the active user index and displays it in an alert.
 *
 * @param {number} i - The index of the user to be set as active.
 *
 * @description
 * This function updates the `activeUserIndex` property with the 
 * provided index `i`. It then triggers an alert to display the 
 * current active user index. This can be useful for debugging 
 * or confirming the active user's selection in the user interface.
 */
  userActive(i: number) {
    this.activeUserIndex = i;
    alert(this.activeUserIndex);
  }

  /**
 * Selects a user from the filtered user list and updates the selected lists accordingly.
 *
 * @param {number} i - The index of the user in the filtered user list to be selected.
 *
 * @description
 * This function first determines the index of the user to be selected from the 
 * main user list (`userList`) based on the provided index `i` of the 
 * `filteredUserList`. If the user exists in the main list (indicated by an 
 * index of not -1), the function performs the following actions:
 * 
 * 1. Calls `addToSelectedLists` to add the user to the selected lists.
 * 2. Calls `deleteUserDataFromLists` to remove user data from both 
 *    the main and filtered lists.
 * 3. Calls `deleteFromFilteredLists` to update the filtered user list.
 * 4. Calls `clearFilteredLists` to reset any filtered user data.
 * 5. Resets the `searchTerm` to an empty string.
 *
 * This function is useful for managing user selections in a user interface, 
 * especially in applications where users can be added or removed dynamically.
 */
  selectUser(i: number) {
    const indexInMainList = this.hideOrShowSidebar.userList.indexOf(this.filteredUserList[i]);
    if (indexInMainList !== -1) {
      this.addToSelectedLists(i, indexInMainList);
      this.deleteUserDataFromLists(i, indexInMainList);
      this.deleteFromFilteredLists(i);
      this.clearFilteredLists();
      this.searchTerm = '';
    }
  }

  /**
 * Adds the selected user's data to the respective selected lists.
 *
 * @param {number} i - The index of the user in the filtered user list (not used in this function).
 * @param {any} indexInMainList - The index of the user in the main user list.
 *
 * @description
 * This function takes the index of a user in the main user list (`indexInMainList`) 
 * and adds the corresponding user's data (including the user, image, UID, and email) 
 * to the selected lists maintained in the sidebar state. 
 * 
 * Specifically, it performs the following actions:
 * 1. Pushes the selected user from `userList` to `selectedUsers`.
 * 2. Pushes the corresponding image from `imageList` to `selectedImages`.
 * 3. Pushes the corresponding UID from `uidList` to `selectedUids`.
 * 4. Pushes the corresponding email from `emailList` to `selectedEmails`.
 * 
 * This function is useful for managing user selections in applications 
 * where users can be selected for various operations, such as adding them 
 * to a channel or a group.
 */
  addToSelectedLists(i: number, indexInMainList: any) {
    this.hideOrShowSidebar.selectedUsers.push(this.hideOrShowSidebar.userList[indexInMainList]);
    this.hideOrShowSidebar.selectedImages.push(this.hideOrShowSidebar.imageList[indexInMainList]);
    this.hideOrShowSidebar.selectedUids.push(this.hideOrShowSidebar.uidList[indexInMainList]);
    this.hideOrShowSidebar.selectedEmails.push(this.hideOrShowSidebar.emailList[indexInMainList]);
  }

  /**
 * Deletes the user's data from the main lists based on the provided index.
 *
 * @param {number} i - The index of the user in the filtered user list (not used in this function).
 * @param {any} indexInMainList - The index of the user in the main user list.
 *
 * @description
 * This function removes a user's data from all relevant lists in the sidebar state. 
 * It takes the index of the user in the main user list (`indexInMainList`) 
 * and performs the following operations:
 * 
 * 1. Removes the user from `userList`.
 * 2. Removes the corresponding image from `imageList`.
 * 3. Removes the corresponding UID from `uidList`.
 * 4. Removes the corresponding email from `emailList`.
 * 
 * This function is typically called when a user is selected for deletion 
 * or removal from a specific context, ensuring that all associated data 
 * is consistently updated across the application.
 */
  deleteUserDataFromLists(i: number, indexInMainList: any) {
    this.hideOrShowSidebar.userList.splice(indexInMainList, 1);
    this.hideOrShowSidebar.imageList.splice(indexInMainList, 1);
    this.hideOrShowSidebar.uidList.splice(indexInMainList, 1);
    this.hideOrShowSidebar.emailList.splice(indexInMainList, 1);
  }

  /**
 * Deletes the user's data from the filtered lists based on the provided index.
 *
 * @param {number} i - The index of the user in the filtered lists.
 *
 * @description
 * This function removes a user's data from all filtered lists. 
 * It takes the index of the user (`i`) and performs the following operations:
 * 
 * 1. Removes the user from `filteredUserList`.
 * 2. Removes the corresponding image from `filteredImageList`.
 * 3. Removes the corresponding UID from `filteredUidList`.
 * 4. Removes the corresponding email from `filteredEmailList`.
 * 
 * This function is typically called when a user is removed from the filtered view, 
 * ensuring that the filtered data remains accurate and up to date.
 */
  deleteFromFilteredLists(i: number) {
    this.filteredUserList.splice(i, 1);
    this.filteredImageList.splice(i, 1);
    this.filteredUidList.splice(i, 1);
    this.filteredEmailList.splice(i, 1);
  }

  /**
 * Adds the selected user's data to the main user lists.
 *
 * @param {number} i - The index of the user in the selected users list.
 *
 * @description
 * This function adds the user's data from the `selectedUsers` array to the main `userList` and corresponding
 * lists for images, UIDs, and emails. It performs the following operations:
 * 
 * 1. Pushes the user from `selectedUsers` at index `i` into the `userList`.
 * 2. Pushes the corresponding image from `selectedImages` into `imageList`.
 * 3. Pushes the corresponding UID from `selectedUids` into `uidList`.
 * 4. Pushes the corresponding email from `selectedEmails` into `emailList`.
 * 
 * This function is typically called when a user is selected to be added to the main user list, ensuring 
 * that all relevant data is kept in sync.
 */
  addToUserList(i: number) {
    this.hideOrShowSidebar.userList.push(this.hideOrShowSidebar.selectedUsers[i]);
    this.hideOrShowSidebar.imageList.push(this.hideOrShowSidebar.selectedImages[i]);
    this.hideOrShowSidebar.uidList.push(this.hideOrShowSidebar.selectedUids[i]);
    this.hideOrShowSidebar.emailList.push(this.hideOrShowSidebar.selectedEmails[i]);
  }

  /**
 * Deletes a user from the selected user lists.
 *
 * @param {number} i - The index of the user in the selected users list to delete.
 *
 * @description
 * This function removes the user's data at index `i` from all selected lists, 
 * including `selectedUsers`, `selectedImages`, `selectedUids`, and `selectedEmails`. 
 * It is typically called when a user is deselected from the selected list.
 */
  deleteFromUserList(i: number) {
    this.hideOrShowSidebar.selectedUsers.splice(i, 1);
    this.hideOrShowSidebar.selectedImages.splice(i, 1);
    this.hideOrShowSidebar.selectedUids.splice(i, 1);
    this.hideOrShowSidebar.selectedEmails.splice(i, 1);
  }

  /**
 * Copies the main sidebar lists to the filtered lists.
 *
 * @description
 * This function clones all main lists (`userList`, `imageList`, `uidList`, `emailList`) 
 * from `hideOrShowSidebar` into their respective filtered lists. This ensures the filtered 
 * lists reflect the main list data, useful when resetting or initializing views.
 */
  copySidebarLists() {
    this.filteredUserList = this.hideOrShowSidebar.userList.slice();
    this.filteredImageList = this.hideOrShowSidebar.imageList.slice();
    this.filteredUidList = this.hideOrShowSidebar.uidList.slice();
    this.filteredEmailList = this.hideOrShowSidebar.emailList.slice();
  }

  /**
 * Reintegrates a selected user back into the main user list and resets view filters.
 *
 * @param {number} i - The index of the user in the selected list to reintegrate.
 *
 * @description
 * This function performs the following actions:
 * 1. Adds the selected user data back to the main user lists via `addToUserList`.
 * 2. Removes the user data from the selected lists with `deleteFromUserList`.
 * 3. Updates the filtered lists to match the main lists with `copySidebarLists`.
 * 4. Clears any search filters by resetting `clearFilteredLists` and the `searchTerm`.
 */
  deleteUser(i: number) {
    this.addToUserList(i);
    this.deleteFromUserList(i);
    this.copySidebarLists();
    this.clearFilteredLists();
    this.searchTerm = '';
  }

}

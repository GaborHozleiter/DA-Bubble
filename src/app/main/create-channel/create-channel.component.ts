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
    id : '',
    description: '',
    users: [],
    uids: [],
    emails: [],
    images: [],
    channelCreatorName : '',
    channelCreatorUid : '', 
    creationsDate : 0
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
  ) {}

  isNameValid() {
    if (this.hideOrShowSidebar.AllChannels.includes(this.newChannel.name)) {
      this.nameIsTaken = true; 
    } else {
      this.nameIsTaken = false;
    }
    console.log(this.nameIsTaken);
  }

  isInputValid(): boolean {
    return this.newChannel.name.length >= 3;
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    if (this.searchTerm) {
        this.clearFilteredLists();
        this.filterUserListAndDetails();
    } else {
        this.clearFilteredLists();
    }
  }

  filterUserListAndDetails(){
    this.hideOrShowSidebar.userList.forEach((user, index) => {
      if (user.toLowerCase().includes(this.searchTerm)) {
          this.filteredUserList.push(user);
          this.filteredImageList.push(this.hideOrShowSidebar.imageList[index]);
          this.filteredUidList.push(this.hideOrShowSidebar.uidList[index]);
          this.filteredEmailList.push(this.hideOrShowSidebar.emailList[index]);
      }
  });
  }

  clearFilteredLists(){
    this.filteredUserList = [];
    this.filteredImageList = [];
    this.filteredUidList = [];
    this.filteredEmailList = [];
  }

  clearSelectedLists(){
    this.hideOrShowSidebar.selectedUsers = [];
    this.hideOrShowSidebar.selectedImages = [];
    this.hideOrShowSidebar.selectedUids = [];
    this.hideOrShowSidebar.selectedEmails = [];
  }

  closeDialog() {
    this.hideOrShowSidebar.createChannelDialogActive = false;
    this.clearFilteredLists();
    this.clearSelectedLists();
    this.searchTerm = '';
    this.newChannel.name = '';
    this.newChannel.description = '';
  }

  notCloseDialog(e: any) {
    e.stopPropagation(e);
  }

  addSelectedUser() {
    this.hideOrShowSidebar.addAllUsersToChannel = false;
    this.hideOrShowSidebar.addSelectedUsersToChannel = true;
  }

  addAllUser() {
    this.hideOrShowSidebar.addAllUsersToChannel = true;
    this.hideOrShowSidebar.addSelectedUsersToChannel = false;
  }

  closeDialogAddUser() {
    this.hideOrShowSidebar.addUserToChanelOpen = false;
    this.clearFilteredLists();
    this.clearSelectedLists();
    this.searchTerm = '';
    this.newChannel.name = '';
    this.newChannel.description = '';
  }

  notCloseDialogAddUser(e: any) {
    e.stopPropagation(e);
  }

  createChannel() {
    this.hideOrShowSidebar.addUserToChanelOpen = true;
    this.hideOrShowSidebar.createChannelDialogActive = false;
  }

  generateId(length: number = 28): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 28; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        this.result += characters[randomIndex];
    }
    return this.result;
}

  async saveChannel() {
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
  }

  restoreSidebarLists(){
    this.hideOrShowSidebar.userList = this.hideOrShowSidebar.AllUsers; 
    this.hideOrShowSidebar.imageList = this.hideOrShowSidebar.AllImages; 
    this.hideOrShowSidebar.uidList = this.hideOrShowSidebar.AllUids;
    this.hideOrShowSidebar.emailList = this.hideOrShowSidebar.AllEmails;
  }

  resetUserDataLists(){
    this.hideOrShowSidebar.userList = [];
    this.hideOrShowSidebar.imageList = [];
    this.hideOrShowSidebar.uidList = [];
    this.hideOrShowSidebar.emailList = [];
}
  clearNewChannelFields(){
    this.newChannel.name = '',
    this.newChannel.id = '',
    this.newChannel.description = '',
    this.newChannel.channelCreatorName = '';
    this.newChannel.channelCreatorUid = '';
    this.newChannel.creationsDate = 0;
    this.newChannel.users = [];
    this.newChannel.emails = [];
  }

  ifAddAllUsersToChannel(){
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

  ifAddSelectedUsersToChannel(){
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

  toJSON() {
    if (this.hideOrShowSidebar.addAllUsersToChannel) {
      return this.ifAddAllUsersToChannel();
    } else {
      return this.ifAddSelectedUsersToChannel();
    }
  }

  openChannel(result: any) {
    for (let i = 0; i < this.hideOrShowSidebar.AllChannelsIds.length; i++) {
      const channelId = this.hideOrShowSidebar.AllChannelsIds[i];
      if(channelId == result){
        this.hideOrShowSidebar.openChannel(i);
      } 
    }
  }

  userActive(i: number) {
    this.activeUserIndex = i;
    alert(this.activeUserIndex);
  }

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

  addToSelectedLists(i: number, indexInMainList: any){
    this.hideOrShowSidebar.selectedUsers.push(this.hideOrShowSidebar.userList[indexInMainList]);
    this.hideOrShowSidebar.selectedImages.push(this.hideOrShowSidebar.imageList[indexInMainList]);
    this.hideOrShowSidebar.selectedUids.push(this.hideOrShowSidebar.uidList[indexInMainList]);
    this.hideOrShowSidebar.selectedEmails.push(this.hideOrShowSidebar.emailList[indexInMainList]);
  }

  deleteUserDataFromLists(i: number, indexInMainList: any){
    this.hideOrShowSidebar.userList.splice(indexInMainList, 1);
    this.hideOrShowSidebar.imageList.splice(indexInMainList, 1);
    this.hideOrShowSidebar.uidList.splice(indexInMainList, 1);
    this.hideOrShowSidebar.emailList.splice(indexInMainList, 1);
  }

  deleteFromFilteredLists(i: number){
    this.filteredUserList.splice(i, 1);
    this.filteredImageList.splice(i, 1);
    this.filteredUidList.splice(i, 1);
    this.filteredEmailList.splice(i, 1);
  }

  addToUserList(i: number){
    this.hideOrShowSidebar.userList.push(this.hideOrShowSidebar.selectedUsers[i]);
    this.hideOrShowSidebar.imageList.push(this.hideOrShowSidebar.selectedImages[i]);
    this.hideOrShowSidebar.uidList.push(this.hideOrShowSidebar.selectedUids[i]);
    this.hideOrShowSidebar.emailList.push(this.hideOrShowSidebar.selectedEmails[i]);
  }

  deleteFromUserList(i: number){
    this.hideOrShowSidebar.selectedUsers.splice(i, 1);
    this.hideOrShowSidebar.selectedImages.splice(i, 1);
    this.hideOrShowSidebar.selectedUids.splice(i, 1);
    this.hideOrShowSidebar.selectedEmails.splice(i, 1);
  }

  copySidebarLists(){
    this.filteredUserList = this.hideOrShowSidebar.userList.slice();
    this.filteredImageList = this.hideOrShowSidebar.imageList.slice();
    this.filteredUidList = this.hideOrShowSidebar.uidList.slice();
    this.filteredEmailList = this.hideOrShowSidebar.emailList.slice();
  }

  deleteUser(i: number) {
    this.addToUserList(i);
    this.deleteFromUserList(i);
    this.copySidebarLists();
    this. clearFilteredLists();
    this.searchTerm = '';
  }

}

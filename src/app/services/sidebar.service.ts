import { inject, Injectable } from '@angular/core';
import { collection, Firestore, getDocs, onSnapshot } from '@angular/fire/firestore';
import { ChannelSelectionService } from './channel-selection.service';
import { ThreadService } from './thread.service';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  sidebarOpen = false;
  createChannelDialogActive = false;
  AllChannels: string[] = [];
  AllChannelsUsers: string[] = [];
  AllChannelsIds: string[] = [];
  AllChannelsEmails: string[] = [];
  AllChannelsImages: string[] = [];
  AllChannelsUids: string[] = [];
  GlobalChannelUids: string[] = [];
  AllChannelsDescriptions: string[] = [];
  AllChannelsCreatorsNames: string[] = [];
  AllChannelsCreatorsUids: string[] = [];
  AllChannelsCreationsDate: number[] = [];
  AllUsers: string[] = [];
  AllEmails: string[] = [];
  AllImages: string[] = [];
  AllUids: string[] = [];
  AllCreators: string[] = [];
  userList: string[] = [];
  imageList: string[] = [];
  uidList: string[] = [];
  emailList: string[] = [];
  popUpOpen = false;
  editProfilOpen = false;
  editProfilContactformOpen = false;
  userProfilOpen = false;
  addUserToChanelOpen = false;
  addUserFromHeaderToChannelOpen = false;
  openUserList = false;
  addAllUsersToChannel = true;
  addSelectedUsersToChannel = false;
  selectedUsers: string[] = [];
  selectedImages: string[] = [];
  selectedUids: string[] = [];
  selectedEmails: string[] = [];
  activeUser = '';
  activeImage = '';
  activeEmail = '';
  activeUid = '';
  currentChannelNumber: number = 0;
  activeUserIndex: number | undefined;
  activeUserProfil: number | undefined;
  activeChannelIndex: number | null | any = 0;
  threadService = inject(ThreadService);
  asd = 0;
  online = false;
  onlineUserUidList: string[] = [];

  constructor(
    private firestore: Firestore,
    private channelSelectionService: ChannelSelectionService
  ) { }

  openChannel(i: number) {
    this.threadService.closeThread();
    this.channelSelectionService.openChannel();
    this.activeChannelIndex = this.AllChannels.length - 1 - i;
    this.channelSelectionService.setSelectedChannel(
      this.AllChannelsIds[i]
    );
    this.currentChannelNumber = i;
    this.activeUserIndex = -1;
  }

  fetchChannels() {
    const channelsCollection = collection(this.firestore, 'Channels');

    onSnapshot(channelsCollection, (querySnapshot) => {
      this.AllChannels = [];
      this.AllChannelsUsers = [];
      this.AllChannelsEmails = [];
      this.AllChannelsIds = [];
      this.AllChannelsImages = [];
      this.AllChannelsUids = [];
      this.AllChannelsDescriptions = [];
      this.AllChannelsCreatorsNames = [];
      this.AllChannelsCreatorsUids = [];
      this.GlobalChannelUids = [];
      this.AllChannelsCreationsDate = [];

      querySnapshot.forEach((doc) => {
        const channelData = doc.data();
        if (channelData['users'].length > 0) {
          this.AllChannels.push(channelData['name']);
          this.AllChannelsUsers.push(channelData['users']);
          this.AllChannelsEmails.push(channelData['emails']);
          this.AllChannelsIds.push(doc.id);
          this.AllChannelsImages.push(channelData['images']);
          this.AllChannelsDescriptions.push(channelData['description']);
          this.AllChannelsCreatorsNames.push(channelData['channelCreatorName']);
          this.AllChannelsCreatorsUids.push(channelData['channelCreatorUid']);
          this.GlobalChannelUids.push(channelData['uids']);
          this.AllChannelsCreationsDate.push(channelData['creationsDate']);

          const uids = channelData['uids'];
          if (Array.isArray(uids)) {
            uids.forEach(uid => {
              this.AllChannelsUids.push(uid);
            });
          } else {
            this.AllChannelsUids.push(uids);
          }
        }

      });
      this.setTopChannel();
    }, (error) => {
      console.error('Fehler beim Abrufen der Kanaldaten:', error);
    });
  }

  setTopChannel() {
    const topChannelIndex = this.AllChannelsIds.length - 1;
    this.channelSelectionService.setSelectedChannel(this.AllChannelsIds[topChannelIndex]);
    this.activeChannelIndex = 0;
  }


  fetchUsers() {
    const usersCollection = collection(this.firestore, 'Users');

    onSnapshot(usersCollection, (querySnapshot) => {
      this.AllUsers = [];
      this.AllImages = [];
      this.AllEmails = [];
      this.AllUids = [];
      this.userList = [];
      this.imageList = [];
      this.uidList = [];
      this.emailList = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        this.AllUsers.push(userData['name']);
        this.AllEmails.push(userData['email']);
        this.AllImages.push(userData['image']);
        this.AllUids.push(userData['uid']);
        this.AllCreators.push(userData['channelCreator']);
        this.userList.push(userData['name']);
        this.imageList.push(userData['image']);
        this.uidList.push(userData['uid']);
        this.emailList.push(userData['email']);
      });
    }, (error) => {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    });
  }
}

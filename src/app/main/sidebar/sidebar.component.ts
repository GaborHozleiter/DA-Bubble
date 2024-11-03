import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import {
  collection,
  getDocs,
  Firestore,
  setDoc,
  doc,
  onSnapshot,
} from '@angular/fire/firestore';
import { ChannelSelectionService } from '../../services/channel-selection.service';
import { AuthService } from '../../services/auth.service';
import { ThreadService } from '../../services/thread.service';
import { DirectMessageSelectionService } from '../../services/direct-message-selection.service';
import { ResponsiveService } from '../../services/responsive.service';
import { SearchFieldComponent } from '../header/search-field/search-field.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, SearchFieldComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: [
    './sidebar.component.scss',
    './sidebar-responsive.component.scss',
  ],
})
export class SidebarComponent implements OnInit, AfterViewInit {
  hoveredChannelTitle = false;
  activetedChannelTitle = true;
  activeUserIndex: number | null = null;
  usersTitleActive = true;
  sidebarService = inject(SidebarService);
  authService = inject(AuthService);
  responsiveService = inject(ResponsiveService);
  checkUserOnlineUser = true;

  /**
 * Initializes the component by fetching channels and users,
 * and checks the screen width.
 */
  ngOnInit(): void {
    this.sidebarService.fetchChannels();
    this.sidebarService.fetchUsers();
    this.checkScreenWidth();
  }

  /**
 * Adds an event listener for mouse movements after the component view has been initialized.
 */
  ngAfterViewInit(): void {
    this.elementRef.nativeElement.addEventListener(
      'mousemove',
      this.setUserOnlineCheck.bind(this)
    );
  }

  constructor(
    private firestore: Firestore,
    private channelSelectionService: ChannelSelectionService,
    private threadService: ThreadService,
    public directMessageSelectionService: DirectMessageSelectionService,
    private elementRef: ElementRef
  ) {}

  /**
 * Checks if the user should be marked as online and sets the online status.
 */
  setUserOnlineCheck() {
    if (this.checkUserOnlineUser) {
      this.setUserOnline();
      this.checkUserOnlineUser = false;
    }
  }

  /**
 * Marks the user as online and fetches the list of online users.
 */
  setUserOnline() {
    if (this.authService.currentUserSignal()) {
      this.userOnline();
      this.fetchUsersOnline();

      this.sidebarService.online = true;
      let time = new Date().getTime();
      if (this.sidebarService.asd == 0) {
        setInterval(() => {
          let newTime = new Date().getTime();
          if (this.sidebarService.online) {
            this.sidebarService.asd = newTime - time;
            this.onlineSince();
          }
        }, 3000);
      }
    }
  }

  /**
 * Updates the current user’s online status in the Firestore database.
 */
  async userOnline() {
    if (this.authService.currentUserSignal()?.uId) {
      const userRef = doc(
        collection(this.firestore, 'online'),
        this.authService.currentUserSignal()?.uId
      );
      await setDoc(userRef, this.toJSON());
    }
  }

  /*
 * Converts the user online data to JSON format.
 * 
 * @returns {Object} User online data in JSON format.
 */
  toJSON() {
    return {
      online: 'yes',
      onlineSince: new Date().getTime(),
      uId: this.authService.currentUserSignal()?.uId,
    };
  }

  /**
 * Updates the timestamp for when the user went online.
 */
  async onlineSince() {
    if (this.authService.currentUserSignal()?.uId) {
      const userRef = doc(
        collection(this.firestore, 'online'),
        this.authService.currentUserSignal()?.uId
      );
      await setDoc(userRef, this.sinceToJSON());
    }
  }

  /*
 * Converts the user online status since timestamp to JSON format.
 * 
 * @returns {Object} User online status since data in JSON format.
 */
  sinceToJSON() {
    return {
      online: 'yes',
      onlineSince: new Date().getTime(),
      uId: this.authService.currentUserSignal()?.uId,
    };
  }

  /**
 * Fetches the list of users currently online from the Firestore database.
 */
  async fetchUsersOnline() {
    const usersCollection = collection(this.firestore, 'online');
    onSnapshot(
      usersCollection,
      (querySnapshot) => {
        this.sidebarService.onlineUserUidList = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (
            userData['online'] == 'yes' &&
            userData['onlineSince'] > new Date().getTime() - 4000
          ) {
            //
            this.sidebarService.onlineUserUidList.push(userData['uId']);
          }
        });
      },
      (error) => {
      }
    );
  }

  /**
 * Listens for window resize events to adjust the UI accordingly.
 * 
 * @param {Event} event - The resize event.
 */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenWidth();
  }

  /**
 * Checks the current width of the window and sets the responsive state.
 */
  private checkScreenWidth(): void {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 1000) {
        this.responsiveService.responsive = true;
      } else {
        this.responsiveService.responsive = false;
      }
    }
  }

  /**
 * Marks the channel title as hovered.
 */
  hoverChannelTitle() {
    this.hoveredChannelTitle = true;
  }

  /**
 * Resets the hover state of the channel title.
 */
  hoverEndChannelTitle() {
    this.hoveredChannelTitle = false;
  }

  /**
 * Toggles the active state of the channel title.
 */
  activeteChannelTitle() {
    this.activetedChannelTitle = !this.activetedChannelTitle;
  }

  /**
 * Opens the dialog to create a new channel.
 */
  addChannel() {
    this.sidebarService.createChannelDialogActive = true;
  }

  /**
 * Activates a channel based on the provided index.
 * 
 * @param {number} i - The index of the channel to activate.
 */
  channelActive(i: number) {
    const reverseIndex = this.sidebarService.AllChannels.length - 1 - i;
    if (
      this.sidebarService.GlobalChannelUids[reverseIndex].includes(
        this.authService.currentUserSignal()?.uId ?? ''
      ) ||
      this.sidebarService.AllChannelsIds[reverseIndex] ==
        'wXzgNEb34DReQq3fEsAo7VTcXXNA'
    ) {
      this.sidebarService.openChannel(reverseIndex);
      this.responsiveService.isChannelOpen = true;
      if (window.innerWidth < 1000) {
        this.responsiveService.isSidebarOpen = false;
      }
      this.sidebarService.activeChannelIndex = i;
      //console.log(this.sidebarService.activeChannelIndex);
    }
  }

  /**
 * Activates a user for direct messaging.
 * 
 * @param {number} i - The index of the user to activate.
 */
  userActive(i: number) {
    this.sidebarService.activeUserIndex = i;
    this.channelSelectionService.openDirectMessage();
    this.directMessageSelectionService.setSelectedChannel(
      this.sidebarService.AllUids[i]
    );
    this.sidebarService.activeChannelIndex = -1;
    this.responsiveService.isDirectMessageOpen = true;
    if (window.innerWidth < 1000) {
      this.responsiveService.isSidebarOpen = false;
    }
  }

  /**
 * Triggers an alert for adding a new message.
 */
  addMessage() {
    alert('Add new message');
  }

  /**
 * Toggles the visibility of the users list.
 */
  openUsersList() {
    this.usersTitleActive = !this.usersTitleActive;
  }

  /**
 * Opens the dialog for sending a new message.
 */
  addNewMessage() {
    this.channelSelectionService.openNewMessage();
    this.responsiveService.isDirectMessageOpen = true;
    if (window.innerWidth < 1000) {
      this.responsiveService.isSidebarOpen = false;
    }
  }
}

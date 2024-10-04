import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { collection, getDocs, Firestore } from '@angular/fire/firestore';
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
export class SidebarComponent implements OnInit {
  hoveredChannelTitle = false;
  activetedChannelTitle = true;
  activeUserIndex: number | null = null;
  usersTitleActive = true;
  sidebarService = inject(SidebarService);
  authService = inject(AuthService);
  responsiveService = inject(ResponsiveService);

  ngOnInit(): void {
    this.sidebarService.fetchChannels();
    this.sidebarService.fetchUsers();
    this.checkScreenWidth();
  }

  constructor(
    private firestore: Firestore,
    private channelSelectionService: ChannelSelectionService,
    private threadService: ThreadService,
    public directMessageSelectionService: DirectMessageSelectionService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenWidth();
  }

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

  hoverChannelTitle() {
    this.hoveredChannelTitle = true;
  }

  hoverEndChannelTitle() {
    this.hoveredChannelTitle = false;
  }

  activeteChannelTitle() {
    this.activetedChannelTitle = !this.activetedChannelTitle;
  }

  addChannel() {
    this.sidebarService.createChannelDialogActive = true;
  }

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
    }
  }

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

  addMessage() {
    alert('Add new message');
  }

  openUsersList() {
    this.usersTitleActive = !this.usersTitleActive;
  }

  addNewMessage() {
    this.channelSelectionService.openNewMessage();
    this.responsiveService.isDirectMessageOpen = true;
    if (window.innerWidth < 1000) {
      this.responsiveService.isSidebarOpen = false;
    }
  }
}

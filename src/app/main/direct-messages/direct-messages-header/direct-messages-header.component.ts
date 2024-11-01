import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ThreadService } from '../../../services/thread.service';
import { ChannelSelectionService } from '../../../services/channel-selection.service';
import { AuthService } from '../../../services/auth.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { DirectMessageSelectionService } from '../../../services/direct-message-selection.service';
import { DirectMessage } from '../../../../models/direct-message.class';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'app-direct-messages-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-messages-header.component.html',
  styleUrl: './direct-messages-header.component.scss',
})
export class DirectMessagesHeaderComponent implements OnInit {
  authService = inject(AuthService);
  channelInfo = inject(SidebarService);
  allUser: any = [];
  messageUser: any;
  imageUrl: any;
  userName: any;
  userUid: any;
  user: any;
  constructor(
    private firestore: Firestore,
    public directMessageSelectionService: DirectMessageSelectionService
  ) {}

  ngOnInit(): void {
    this.subUser();
    this.setOpenUser();
  }

  /**
   * Sets the current user ID from the authentication service.
   */
  setOpenUser() {
    this.user = this.authService.currentUserSignal()?.uId;
  }

  /**
   * Subscribes to user updates from the Firestore database.
   * Fetches a list of users and updates the local user list.
   * The list is limited to 1000 users.
   */
  subUser() {
    const q = query(collection(this.firestore, 'Users'), limit(1000));
    onSnapshot(q, (list) => {
      this.allUser = [];
      list.forEach((element) => {
        this.allUser.push(this.setNoteObjectUser(element.data(), element.id));
      });
      this.setUser();
    });
  }

  /**
   * Subscribes to the selected channel for direct messages.
   * Updates the current message user and retrieves the user's profile.
   */
  setUser() {
    this.directMessageSelectionService
      .getSelectedChannel()
      .subscribe((value) => {
        this.messageUser = value;
        this.getProfile();
      });
  }

  /**
   * Retrieves the profile of the currently selected user.
   * Updates the image URL, username, and user UID based on the selected user.
   */
  getProfile() {
    for (let i = 0; i < this.allUser.length; i++) {
      const element = this.allUser[i];
      if (element.uid === this.messageUser) {
        this.imageUrl = element.image;
        this.userName = element.name;
        this.userUid = element.uid;
      }
    }
  }

  /**
   * Creates a user object from the provided data.
   *
   * @param {Object} obj - The user data object.
   * @param {string} id - The ID of the user.
   * @returns {Object} - The structured user object with email, image, name, and uid.
   */
  setNoteObjectUser(obj: any, id: string): object {
    return {
      email: obj.email || '',
      image: obj.image || '',
      name: obj.name || '',
      uid: obj.uid || '',
    };
  }
}

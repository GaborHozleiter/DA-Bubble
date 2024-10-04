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

@Component({
  selector: 'app-direct-messages-header',
  standalone: true,
  imports: [],
  templateUrl: './direct-messages-header.component.html',
  styleUrl: './direct-messages-header.component.scss',
})
export class DirectMessagesHeaderComponent implements OnInit {
  authService = inject(AuthService);
  allUser: any = [];
  messageUser: any;
  imageUrl: any;
  userName: any;
  constructor(
    private firestore: Firestore,
    public directMessageSelectionService: DirectMessageSelectionService
  ) {}

  ngOnInit(): void {
    this.subUser();
  }

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

  setUser() {
    this.directMessageSelectionService
      .getSelectedChannel()
      .subscribe((value) => {
        this.messageUser = value;
        this.getProfile();
      });
  }

  getProfile() {
    for (let i = 0; i < this.allUser.length; i++) {
      const element = this.allUser[i];
      if (element.uid === this.messageUser) {
        this.imageUrl = element.image;
        this.userName = element.name;
      }
    }
  }

  setNoteObjectUser(obj: any, id: string) {
    return {
      email: obj.email || '',
      image: obj.image || '',
      name: obj.name || '',
      uid: obj.uid || '',
    };
  }
}

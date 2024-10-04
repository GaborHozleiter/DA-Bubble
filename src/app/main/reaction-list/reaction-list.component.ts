import { Component, inject } from '@angular/core';
import { ChannelSelectionService } from '../../services/channel-selection.service';
import { CommonModule } from '@angular/common';
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
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reaction-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reaction-list.component.html',
  styleUrl: './reaction-list.component.scss',
})
export class ReactionListComponent {
  user: any;
  allUser: any = [];
  selectedReaction: any;

  authService = inject(AuthService);

  constructor(
    public channelSelectionService: ChannelSelectionService,
    private firestore: Firestore
  ) {}
  ngOnInit(): void {
    this.channelSelectionService.getselectedReaction().subscribe((reaction) => {
      this.selectedReaction = reaction;
    });
    this.setOpenUser();
    this.subUser();
  }

  setOpenUser() {
    this.user = this.authService.currentUserSignal()?.uId;
  }

  subUser() {
    const q = query(collection(this.firestore, 'Users'), limit(1000));
    onSnapshot(q, (list) => {
      this.allUser = [];
      list.forEach((element) => {
        this.allUser.push(this.setNoteObjectUser(element.data(), element.id));
      });
    });
  }

  setNoteObjectUser(obj: any, id: string) {
    return {
      email: obj.email || '',
      image: obj.image || '',
      name: obj.name || '',
      uid: obj.uid || '',
    };
  }

  getUser(uid: any) {
    for (let i = 0; i < this.allUser.length; i++) {
      const element = this.allUser[i];
      if (element.uid === uid) {
        return element;
      }
    }
  }

  splitStringBySpace(input: string): string[] {
    return input.split(' ');
  }
}

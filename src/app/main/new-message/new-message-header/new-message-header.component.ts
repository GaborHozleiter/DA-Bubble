import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  Firestore,
  collection,
  limit,
  onSnapshot,
  query,
} from '@angular/fire/firestore';
import { NewMessageSelectionService } from '../../../services/new-message-selection.service';

@Component({
  selector: 'app-new-message-header',
  standalone: true,
  imports: [],
  templateUrl: './new-message-header.component.html',
  styleUrl: './new-message-header.component.scss',
})
export class NewMessageHeaderComponent implements OnInit {
  allChannel: any;
  allUser: any;
  allUserSorted: any;
  allChannelSorted: any;

  constructor(
    private firestore: Firestore,
    private newMessageSelectionService: NewMessageSelectionService
  ) {}

  ngOnInit(): void {
    this.subChannels();
    this.subUser();
  }

  subChannels() {
    const q = query(collection(this.firestore, 'Channels'), limit(1000));
    onSnapshot(q, (list) => {
      this.allChannel = [];
      list.forEach((element) => {
        this.allChannel.push(this.setNoteChannel(element.data(), element.id));
      });
    });
  }

  subUser() {
    const q = query(collection(this.firestore, 'Users'), limit(1000));
    onSnapshot(q, (list) => {
      this.allUser = [];
      list.forEach((element) => {
        this.allUser.push(this.setNoteObjectUser(element.data(), element.id));
      });
      this.sortResults('');
    });
  }

  setNoteChannel(obj: any, id: string) {
    return {
      id: id,
      channelCreatorUid: obj.channelCreatorUid || '',
      creationsDate: obj.creationsDate || '',
      description: obj.description || '',
      images: obj.images || '',
      name: obj.name || '',
      uids: obj.uids || '',
    };
  }

  setNoteObjectUser(obj: any, id: string) {
    return {
      email: obj.email || '',
      image: obj.image || '',
      name: obj.name || '',
      uid: obj.uid || '',
    };
  }

  sortResults(inputValue: string) {
    this.allChannelSorted = [];
    this.allUserSorted = [];

    const lowerCaseInputValue = inputValue.toLowerCase();

    for (let i = 0; i < this.allChannel.length; i++) {
      const element = this.allChannel[i];
      if (element.name.toLowerCase().includes(lowerCaseInputValue)) {
        this.allChannelSorted.push(element);
      }
    }

    for (let i = 0; i < this.allUser.length; i++) {
      const element = this.allUser[i];
      if (
        element.name.toLowerCase().includes(lowerCaseInputValue) ||
        element.email.toLowerCase().includes(lowerCaseInputValue)
      ) {
        this.allUserSorted.push(element);
      }
    }

    this.newMessageSelectionService.setAllUserSorted(this.allUserSorted);
    this.newMessageSelectionService.setAllChannelSorted(this.allChannelSorted);
  }
}

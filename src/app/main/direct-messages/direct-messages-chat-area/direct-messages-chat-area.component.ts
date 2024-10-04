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
  selector: 'app-direct-messages-chat-area',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './direct-messages-chat-area.component.html',
  styleUrl: './direct-messages-chat-area.component.scss',
})
export class DirectMessagesChatAreaComponent implements AfterViewInit, OnInit {
  authService = inject(AuthService);

  user: any;
  messageUser: any;

  allMessagesSortedDate: any = [];
  allMessagesSorted: DirectMessage[] = [];
  allMessages: DirectMessage[] = [];
  allUser: any = [];
  allDates: any = [];
  dateCounter = 0;
  scrolled = true;
  date = false;
  emojiselectior = false;
  emojiSelector = false;
  openEditMessage: any = '';
  editedMessage: any;

  @ViewChild('messageContainer') private messageContainer?: ElementRef;
  containerClasses: { [key: string]: boolean } = {};

  @ViewChildren('messageList') messageLoaded!: QueryList<any>;
  @ViewChild('messageTextarea') messageTextarea: any;

  @ViewChild('myDiv') myDiv!: ElementRef;
  currentChannel = 'Entwicklerteam';

  constructor(
    private threadService: ThreadService,
    private firestore: Firestore,
    public directMessageSelectionService: DirectMessageSelectionService
  ) {}

  ngOnInit(): void {
    this.subUser();
    this.subMessages();
  }

  ngAfterViewInit(): void {
    this.messageLoaded.changes.subscribe((t) => {
      if (this.scrolled) {
        this.scrolled = false;
        this.scrollToBottom();
      }
    });
  }

  subMessages() {
    if (this.user && this.messageUser) {
      const q = query(
        collection(
          this.firestore,
          'direcmessages',
          this.user,
          this.messageUser
        ),
        limit(1000)
      );
      onSnapshot(q, (list) => {
        this.allMessages = [];
        list.forEach((element) => {
          this.allMessages.push(this.setNoteObject(element.data(), element.id));
        });
        this.sortMessages();
        this.dateLoaded();
      });
    }
  }

  setUser() {
    this.directMessageSelectionService
      .getSelectedChannel()
      .subscribe((value) => {
        this.messageUser = value;
        this.subMessages();
      });
  }

  setOpenUser() {
    this.user = this.authService.currentUserSignal()!.uId;
  }

  subUser() {
    const q = query(collection(this.firestore, 'Users'), limit(1000));
    onSnapshot(q, (list) => {
      this.allUser = [];
      list.forEach((element) => {
        this.allUser.push(this.setNoteObjectUser(element.data(), element.id));
      });
      this.setOpenUser();
      this.setUser();
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

  setNoteObject(obj: any, id: string): DirectMessage {
    return {
      id: id,
      uid: obj.uid || '',
      message: obj.message || '',
      weekday: obj.weekday || '',
      year: obj.year || '',
      month: obj.month || '',
      day: obj.day || '',
      hour: obj.hour || '',
      minute: obj.minute || '',
      seconds: obj.seconds || '',
      milliseconds: obj.milliseconds || '',
      user: obj.user || '',
      fileUrl: obj.fileUrl || '',
      fileName: obj.fileName || '',
      threadCount: obj.threadCount || '',
      checkMark: obj.checkMark || '',
      handshake: obj.handshake || '',
      thumbsUp: obj.thumbsUp || '',
      thumbsDown: obj.thumbsDown || '',
      rocket: obj.rocket || '',
      nerdFace: obj.nerdFace || '',
      noted: obj.noted || '',
      shushingFace: obj.shushingFace || '',
      communicationType: obj.communicationType || '',
    };
  }

  sortMessages(): void {
    this.allMessagesSorted = [];
    this.allMessagesSorted = [...this.allMessages].sort((a, b) => {
      const dateA = new Date(
        a.year,
        a.month - 1,
        a.day,
        a.hour,
        a.minute,
        a.seconds
      );
      const dateB = new Date(
        b.year,
        b.month - 1,
        b.day,
        b.hour,
        b.minute,
        b.seconds
      );
      return dateA.getTime() - dateB.getTime(); // Älteste zuerst, daher umgekehrt
    });
  }

  scrollToBottom(): void {
    if (typeof window !== 'undefined') {
      // Browser-spezifischer Code hier
      const container = document.getElementById('messageContainer');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }

  dateLoaded() {
    this.allMessagesSortedDate = [];
    this.allDates = [];

    for (let i = 0; i < this.allMessagesSorted.length; i++) {
      const element = this.allMessagesSorted[i];
      let date =
        element.day.toString().padStart(2, '0') +
        '.' +
        element.month.toString().padStart(2, '0') +
        '.' +
        element.year.toString();

      this.dateCounter++;

      if (Array.isArray(this.allDates) && this.allDates.includes(date)) {
        element.date = false;
      } else {
        this.allDates.push(date);
        element.date = true;
      }
    }
    this.allMessagesSortedDate = this.allMessagesSorted;
  }

  getMonthName(monthNumber: number): string {
    const months: string[] = [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember',
    ];

    if (monthNumber < 1 || monthNumber > 12) {
      throw new Error(
        'Ungültige Monatszahl. Bitte geben Sie eine Zahl zwischen 1 und 12 ein.'
      );
    }

    return months[monthNumber - 1];
  }

  getFormattedTime(hour: any, minute: any): any {
    const hours = hour.toString().padStart(2, '0');
    const minutes = minute.toString().padStart(2, '0');
    return `${hours}:${minutes} Uhr`;
  }

  getUsername(uid: any) {
    for (let i = 0; i < this.allUser.length; i++) {
      const element = this.allUser[i];
      if (element.uid == uid) {
        return element.name;
      }
    }
  }
  getProfileImg(uid: any) {
    for (let i = 0; i < this.allUser.length; i++) {
      const element = this.allUser[i];
      if (element.uid === uid) {
        return element.image;
      }
    }
  }

  openEmojiSelection() {
    this.emojiselectior = !this.emojiselectior;
  }

  closeEmojiSelector() {
    this.emojiselectior = false;
  }

  addReaction(reaction: any, message: any) {
    this.updateMessageVariable(
      message.id,
      this.authService.currentUserSignal()?.uId,
      reaction
    );
    this.updateMessageVariableTwo(
      message.id,
      this.authService.currentUserSignal()?.uId,
      reaction
    );
  }

  async updateMessageVariable(
    messageId: any,
    newValue: any,
    variableName: any
  ) {
    const messageRef = doc(
      this.firestore,
      'direcmessages',
      this.user,
      this.messageUser,
      messageId
    );

    try {
      // Get the current value of the variable
      const messageSnapshot = await getDoc(messageRef);
      if (messageSnapshot.exists()) {
        const currentData = messageSnapshot.data();
        let currentValue = currentData[variableName] || '';

        // Convert currentValue to an array of values
        let valuesArray = currentValue.split(' ').filter((value: any) => value);

        if (valuesArray.includes(newValue)) {
          // Remove the newValue if it exists
          valuesArray = valuesArray.filter((value: any) => value !== newValue);
        } else {
          // Append the new value with a space if it doesn't exist
          valuesArray.push(newValue);
        }

        // Join the array back to a string
        const updatedValue = valuesArray.join(' ');

        // Update the document with the new value
        await updateDoc(messageRef, {
          [variableName]: updatedValue,
        });
      } else {
      }
    } catch (err) {}
  }

  async updateMessageVariableTwo(
    messageId: any,
    newValue: any,
    variableName: any
  ) {
    const messageRef = doc(
      this.firestore,
      'direcmessages',
      this.messageUser,
      this.user,
      messageId
    );

    try {
      // Get the current value of the variable
      const messageSnapshot = await getDoc(messageRef);
      if (messageSnapshot.exists()) {
        const currentData = messageSnapshot.data();
        let currentValue = currentData[variableName] || '';

        // Convert currentValue to an array of values
        let valuesArray = currentValue.split(' ').filter((value: any) => value);

        if (valuesArray.includes(newValue)) {
          // Remove the newValue if it exists
          valuesArray = valuesArray.filter((value: any) => value !== newValue);
        } else {
          // Append the new value with a space if it doesn't exist
          valuesArray.push(newValue);
        }

        // Join the array back to a string
        const updatedValue = valuesArray.join(' ');

        // Update the document with the new value
        await updateDoc(messageRef, {
          [variableName]: updatedValue,
        });
        console.log('Document successfully updated!');
      } else {
        console.log('No such document!');
      }
    } catch (err) {
      console.error('Error updating document: ', err);
    }
  }

  splitWords(input: string) {
    if (input) {
      let words = input.trim().split(/\s+/).length;
      return words;
    } else {
      return 0;
    }
  }

  isItToday(message: any) {
    const now = new Date();
    if (
      message.year == now.getFullYear() &&
      message.month == now.getMonth() + 1 &&
      message.day == now.getDate()
    ) {
      return false;
    } else {
      return true;
    }
  }

  editMessage(message: any) {
    this.editedMessage = message.message;
    if (this.openEditMessage == message.id) {
      this.openEditMessage = false;
      this.emojiSelector = false;
    } else {
      this.openEditMessage = message.id;
      this.emojiSelector = false;
    }
  }

  openEmojiSelector() {
    this.emojiSelector = !this.emojiSelector;
  }

  insertEmoji(emoji: any) {
    const textarea: HTMLTextAreaElement = this.messageTextarea.nativeElement;

    // Aktuelle Position des Cursors
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    // Wert des Textarea-Felds aktualisieren
    this.editedMessage =
      textarea.value.substring(0, startPos) +
      emoji +
      textarea.value.substring(endPos, textarea.value.length);

    // Cursor-Position nach dem Einfügen des Textes setzen
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = startPos + emoji.length;
    }, 0);
  }

  addEmoji($event: any) {
    let element = $event;
    this.insertEmoji(element['emoji'].native);
  }

  saveEdit(message: any) {
    this.updateMessage(message.id);
    this.openEditMessage = '';
  }

  async updateMessage(messageId: any) {
    let messageRef = doc(
      this.firestore,
      'direcmessages',
      this.user,
      this.messageUser,
      messageId
    );
    await updateDoc(messageRef, {
      message: this.editedMessage,
    });

    messageRef = doc(
      this.firestore,
      'direcmessages',
      this.messageUser,
      this.user,
      messageId
    );
    await updateDoc(messageRef, {
      message: this.editedMessage,
    });
  }

  onMessageInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.editedMessage = textarea.value;
  }

  reacted(message: any) {
    if (message.includes(this.user)) {
      return true;
    } else {
      return false;
    }
  }
}

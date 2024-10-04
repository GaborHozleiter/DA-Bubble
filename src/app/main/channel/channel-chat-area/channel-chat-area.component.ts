import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  inject,
  OnInit,
  PLATFORM_ID,
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
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Message } from '../../../../models/message.class';
import { ThreadService } from '../../../services/thread.service';
import { ChannelSelectionService } from '../../../services/channel-selection.service';
import { AuthService } from '../../../services/auth.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { SidebarService } from '../../../services/sidebar.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ResponsiveService } from '../../../services/responsive.service';
import { ChatAreaService } from '../../../services/chat-area.service';

@Component({
  selector: 'app-channel-chat-area',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './channel-chat-area.component.html',
  styleUrl: './channel-chat-area.component.scss',
})
export class ChannelChatAreaComponent implements AfterViewInit, OnInit {
  authService = inject(AuthService);

  allChannels: any = [];
  allMessagesSortedDate: any = [];
  allMessagesSorted: Message[] = [];
  allMessages: Message[] = [];
  allUser: any = [];
  allDates: any = [];
  dateCounter = 0;
  scrolled = true;
  date = false;
  emojiselectior = false;
  emojiSelector = false;
  openEditMessage: any = '';
  editedMessage: any;
  user: any;

  reactions = [
    {
      name: 'checkMark',
      icon: './../../../../assets/reactions/check-mark.png',
    },
    { name: 'handshake', icon: './../../../../assets/reactions/handshake.png' },
    { name: 'thumbsUp', icon: './../../../../assets/reactions/thumbs-up.png' },
    {
      name: 'thumbsDown',
      icon: './../../../../assets/reactions/thumbs-down.png',
    },
    { name: 'rocket', icon: './../../../../assets/reactions/rocket.png' },
    { name: 'nerdFace', icon: './../../../../assets/reactions/nerd-face.png' },
    {
      name: 'shushingFace',
      icon: './../../../../assets/reactions/shushing-face.png',
    },
  ];

  @ViewChild('messageContainer') private messageContainer?: ElementRef;
  containerClasses: { [key: string]: boolean } = {};

  @ViewChildren('messageList') messageLoaded!: QueryList<any>;
  @ViewChild('messageTextarea') messageTextarea: any;
  @ViewChild('inputChatArea') inputChatArea: any;

  currentChannel: any;
  currentChannelId: any;
  channelInfo = inject(SidebarService);
  responsiveService = inject(ResponsiveService);
  $event: any;

  constructor(
    private threadService: ThreadService,
    private firestore: Firestore,
    public channelSelectionService: ChannelSelectionService,
    public chatAreaService: ChatAreaService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  setOpenUser() {
    this.user = this.authService.currentUserSignal()?.uId;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('click', this.handleClick.bind(this));
    }
  }

  ngAfterViewInit(): void {
    this.channelSelectionService.getSelectedChannel().subscribe((channel) => {
      this.currentChannelId = channel;
      this.subUser();
      this.subMessages();
      this.subChannels();
    });

    this.messageLoaded.changes.subscribe((t) => {
      if (this.scrolled) {
        this.scrolled = false;
        this.scrollToBottom();
      }
    });
  }

  setImg(src: any) {
    this.channelSelectionService.setSelectedImg(src);
  }

  subChannels() {
    const q = query(collection(this.firestore, 'Channels'), limit(1000));
    onSnapshot(q, (list) => {
      this.allChannels = [];
      let channel: any;
      list.forEach((element) => {
        channel = this.chatAreaService.setNoteChannel(
          element.data(),
          element.id
        );
        this.allChannels.push(channel);

        if (channel.id == this.currentChannelId) {
          this.currentChannel = channel;
        }
      });
    });
  }

  openThread(thread: any) {
    if (this.threadService.isThreadOpen()) {
      this.threadService.closeThread();
      setTimeout(() => {
        this.threadService.openThread(thread);
      }, 300);
    } else {
      this.threadService.openThread(thread);
      this.responsiveService.isThreadOpen = true;
    }
  }

  subMessages() {
    if (this.currentChannelId) {
      const q = query(
        collection(
          this.firestore,
          'Channels',
          this.currentChannelId,
          'messages'
        ),
        limit(1000)
      );
      onSnapshot(q, (list) => {
        this.allMessages = [];
        list.forEach((element) => {
          this.allMessages.push(
            this.chatAreaService.setNoteObject(element.data(), element.id)
          );
        });
        this.sortMessages();
        this.dateLoaded();
      });
    }
  }

  subUser() {
    const q = query(collection(this.firestore, 'Users'), limit(1000));
    onSnapshot(q, (list) => {
      this.allUser = [];
      list.forEach((element) => {
        this.allUser.push(
          this.chatAreaService.setNoteObjectUser(element.data(), element.id)
        );
      });
      this.setOpenUser();
    });
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

  onChannelChange(channel: string): void {
    setTimeout(() => {
      this.subMessages(); // Ensure messages are fetched on channel change
    }, 10);
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
    let src = [
      this.firestore,
      'Channels',
      this.currentChannelId,
      'messages',
      message.id,
    ]; // src kann so lang sein, wie du es brauchst
    this.chatAreaService.updateMessageVariable(
      message.id,
      this.authService.currentUserSignal()?.uId,
      reaction,
      src
    );
  }

  getChannelCreator(uid: any) {
    if (uid == this.authService.currentUserSignal()?.uId) {
      return 'Du hast diesen Channel';
    } else {
      if (this.getUser(uid)) {
        return this.getUser(uid).name + ' ' + 'hat diesen Channel';
      } else {
        return 'undefined';
      }
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
      this.getMessageEdit(message);
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

  saveEdit(event: any, message: any) {
    let editedMessage = this.inputChatArea.nativeElement.innerHTML;
    this.updateMessage(event, message.id);
    this.openEditMessage = '';
  }

  async updateMessage(event: any, messageId: string) {
    event?.preventDefault();
    let message = '';
    const messageTextarea = document.querySelector(
      '.textAreaChatArea'
    ) as HTMLElement;

    if (messageTextarea) {
      const children = messageTextarea.childNodes;
      let result = '';

      children.forEach((child) => {
        if (
          child.nodeType === Node.ELEMENT_NODE &&
          (child as HTMLElement).tagName === 'SPAN'
        ) {
          // Es ist ein span-Element, extrahiere das data-uid
          const uid = (child as HTMLElement).getAttribute('data-uid');
          if (uid) {
            // Überprüfe das erste Zeichen des data-uid
            const firstChar = (child as HTMLElement).innerHTML.charAt(0);
            if (firstChar === '@') {
              result += `₿ЯæŶ∆Ωг${uid} `;
            } else if (firstChar === '#') {
              result += `₣Ж◊ŦΨø℧${uid} `;
            } else {
              // Standardfall, falls das erste Zeichen weder @ noch # ist
              result += `${uid} `;
            }
          }
        } else if (child.nodeType === Node.TEXT_NODE) {
          // Es ist ein Textknoten, füge den Textinhalt hinzu
          result += child.textContent;
        }
      });

      // Speichere das Ergebnis in der message.message Variable
      message = result.trim(); // Ergebnis z.B.: "asddasd @zqk0MWq9TcWYUdYtXpTTKsnFro12 sdasad @7gMhlfm1xsVsPe7Hq7kdIPzLMQJ2"
    }

    // Nachricht in der Firestore-Datenbank aktualisieren
    const messageRef = doc(
      this.firestore,
      'Channels',
      this.currentChannelId,
      'messages',
      messageId
    );

    await updateDoc(messageRef, {
      message: message.trim(),
      updatedAt: new Date(), // Optional: Zeitpunkt der letzten Änderung speichern
    }).catch((err) => {
      console.error('Fehler beim Aktualisieren der Nachricht:', err);
    });
  }

  // async updateMessage(messageId: any) {
  //   const messageRef = doc(
  //     this.firestore,
  //     'Channels',
  //     this.currentChannelId,
  //     'messages',
  //     messageId
  //   );
  //   await updateDoc(messageRef, {
  //     message: this.editedMessage,
  //   });
  // }

  onMessageInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.editedMessage = textarea.value;
  }

  reacted(id: any) {
    if (id.includes(this.user)) {
      return true;
    } else {
      return false;
    }
  }

  getMessage(message: any): SafeHtml {
    const regexUser = /₿ЯæŶ∆Ωг(\S+)/g;
    const regexChannel = /₣Ж◊ŦΨø℧(\S+)/g;
    let modifiedMessage = message.message.replace(
      regexUser,
      (match: any, p1: any) => {
        if (this.getUser(p1) != undefined) {
          const spanClass =
            message.uid !== this.authService.currentUserSignal()?.uId
              ? 'tagHighlight'
              : 'tagHighlightSend';
          return /*html*/ `
          <span class="${spanClass}" data-uid="${p1}" contentEditable="false" data-uid = "${p1}">@${
            this.getUser(p1).name
          }</span>`;
        } else {
          return 'undefined';
        }
      }
    );

    modifiedMessage = modifiedMessage.replace(
      regexChannel,
      (match: any, p1: any) => {
        const spanClass =
          message.uid !== this.authService.currentUserSignal()?.uId
            ? 'tagHighlightChannel'
            : 'tagHighlightSendChannel';
        if (this.getChannel(p1) != undefined) {
          return /*html*/ `
          <span class="${spanClass}" data-uid="${p1}" contentEditable="false" data-uid = "${p1}">#${
            this.getChannel(p1).name
          }</span>`;
        } else {
          return 'undefined';
        }
      }
    );

    return this.sanitizer.bypassSecurityTrustHtml(modifiedMessage);
  }

  getMessageEdit(message: any) {
    const regexUser = /₿ЯæŶ∆Ωг(\S+)/g;
    const regexChannel = /₣Ж◊ŦΨø℧(\S+)/g;
    let modifiedMessage = message.message.replace(
      regexUser,
      (match: any, p1: any) => {
        if (this.getUser(p1) != undefined) {
          const spanClass = 'tagHighlight';
          return `<span class="${spanClass}" data-uid="${p1}" contentEditable="false">@${
            this.getUser(p1).name
          }</span>`;
        } else {
          return 'undefined';
        }
      }
    );

    modifiedMessage = modifiedMessage.replace(
      regexChannel,
      (match: any, p1: any) => {
        if (this.getChannel(p1) != undefined) {
          const spanClass = 'tagHighlightChannel';
          return `<span class="${spanClass}" data-uid="${p1}" contentEditable="false">#${
            this.getChannel(p1).name
          }</span>`;
        } else {
          return 'undefined';
        }
      }
    );

    this.insertHTML(modifiedMessage);
  }

  insertHTML(htmlContent: any) {
    const interval = setInterval(() => {
      if (this.inputChatArea && this.inputChatArea.nativeElement) {
        this.inputChatArea.nativeElement.innerHTML = htmlContent;

        clearInterval(interval);
      }
    }, 100);
  }

  handleClick(event: Event) {
    const target = event.target as HTMLElement;

    // Überprüfen, ob das angeklickte Element eine der span-Tags ist
    if (
      target.classList.contains('tagHighlight') ||
      target.classList.contains('tagHighlightSend')
    ) {
      const uid = target.getAttribute('data-uid');
      if (uid) {
        this.openUserProfil(uid);
      }
    } else if (
      target.classList.contains('tagHighlightChannel') ||
      target.classList.contains('tagHighlightSendChannel')
    ) {
      const uid = target.getAttribute('data-uid');
      if (uid) {
        this.openChannel(uid);
      }
    }
  }

  openChannel(uid: any) {
    const currentUserId = this.authService.currentUserSignal()?.uId;

    for (let i = 0; i < this.getChannel(uid).uids.length; i++) {
      const element = this.getChannel(uid).uids[i];
      if (
        element.includes(currentUserId) ||
        uid == 'wXzgNEb34DReQq3fEsAo7VTcXXNA'
      ) {
        this.channelSelectionService.openChannel();
        this.channelSelectionService.setSelectedChannel(uid);
      }
    }
  }

  openUserProfil(uid: any) {
    this.channelInfo.userProfilOpen = true;
    this.channelInfo.activeUserProfil = 0;
    this.channelInfo.activeUser = this.getUser(uid).name;
    this.channelInfo.activeEmail = this.getUser(uid).email;
    this.channelInfo.activeImage = this.getUser(uid).image;
    this.channelInfo.activeUid = uid;
  }

  getUser(uid: any) {
    for (let i = 0; i < this.allUser.length; i++) {
      const element = this.allUser[i];
      if (element.uid === uid) {
        return element;
      }
    }
    return { name: undefined };
  }

  getChannel(id: any) {
    for (let i = 0; i < this.allChannels.length; i++) {
      const element = this.allChannels[i];
      if (element.id === id) {
        return element;
      }
    }
    return undefined; // wird zurückgegeben, wenn nichts gefunden wurde
  }

  splitStringBySpace(input: string): string[] {
    return input.split(' ');
  }
}

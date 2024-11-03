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
import { DirectMessageSelectionService } from '../../../services/direct-message-selection.service';

@Component({
  selector: 'app-direct-messages-chat-area',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './direct-messages-chat-area.component.html',
  styleUrls: [
    './direct-messages-chat-area.component.scss',
    'direct-messages-chat-area.component.responsive.scss',
  ],
})
export class DirectMessagesChatAreaComponent implements AfterViewInit, OnInit {
  authService = inject(AuthService);

  messageUser: any;
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
      name: 'noted',
      icon: './../../../../assets/reactions/noted.png',
    },
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
    public directMessageSelectionService: DirectMessageSelectionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Sets the currently selected user based on the selected channel from the DirectMessageSelectionService.
   * Once set, it subscribes to messages for the selected user.
   */
  setUser() {
    this.directMessageSelectionService
      .getSelectedChannel()
      .subscribe((value) => {
        this.messageUser = value;
        this.subMessages();
      });
  }

  /**
   * Sets the current user by retrieving the user ID from the AuthService.
   */
  setOpenUser() {
    this.user = this.authService.currentUserSignal()?.uId;
  }

  /**
   * Initializes the component. If the code is running in a browser environment, it sets up a global click event listener.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('click', this.handleClick.bind(this));
    }
  }

  /**
   * After the component view initializes, it subscribes to the selected channel from the ChannelSelectionService,
   * updates the current channel and user, and loads messages and channels. Also scrolls to the bottom after a brief delay.
   */
  ngAfterViewInit(): void {
    this.channelSelectionService.getSelectedChannel().subscribe((channel) => {
      this.currentChannelId = channel;
      this.subUser();
      this.setUser();
      this.setOpenUser();
      this.subMessages();
      this.subChannels();
      setTimeout(() => {
        this.scrollToBottom();
      }, 5);
    });

    this.messageLoaded.changes.subscribe((t) => {
      if (this.scrolled) {
        this.scrolled = false;
        this.scrollToBottom();
      }
    });
  }

  /**
   * Sets the selected image source in the ChannelSelectionService.
   * @param {any} src - Image source to set.
   */
  setImg(src: any) {
    this.channelSelectionService.setSelectedImg(src);
  }

  /**
   * Subscribes to all available channels in the Firestore database, updates the local list of channels,
   * and sets the current channel based on the selected channel ID.
   */
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

  /**
   * Opens a thread. If a thread is already open, it first closes it, then opens the new thread after a short delay.
   * @param {any} thread - Thread object to open.
   */
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

  /**
   * Subscribes to direct messages between the current user and the selected message user from the Firestore.
   * Updates the list of messages and sorts them by date.
   */
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
          this.allMessages.push(
            this.chatAreaService.setNoteObject(element.data(), element.id)
          );
        });
        this.sortMessages();
        this.dateLoaded();
      });
    }
  }

  /**
   * Subscribes to user data in the Firestore, updates the list of all users.
   */
  subUser() {
    const q = query(collection(this.firestore, 'Users'), limit(1000));
    onSnapshot(q, (list) => {
      this.allUser = [];
      list.forEach((element) => {
        this.allUser.push(
          this.chatAreaService.setNoteObjectUser(element.data(), element.id)
        );
      });
    });
  }

  /**
   * Sorts the messages chronologically by date and time, from oldest to newest.
   */
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
      return dateA.getTime() - dateB.getTime();
    });
  }

  /**
   * Scrolls the message container to the bottom.
   */
  scrollToBottom() {
    if (typeof window !== 'undefined') {
      const container = document.getElementById('messageContainer');
      if (container) {
        setTimeout(() => {
          container!.scrollTop = container!.scrollHeight;
        }, 1000);
      }
    }
  }

  /**
   * Processes loaded dates for sorted messages, adding only unique dates to the list.
   * Sets the date display for messages based on whether the date is unique.
   */
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

  /**
   * Fetches messages when a channel changes, ensuring updates after a slight delay.
   * @param {string} channel - ID of the channel to change to.
   */
  onChannelChange(channel: string): void {
    setTimeout(() => {
      this.subMessages();
    }, 10);
  }

  /**
   * Retrieves a user's profile image based on their user ID.
   * @param {any} uid - User ID.
   * @returns {string} - The profile image URL of the user.
   */
  getProfileImg(uid: any) {
    for (let i = 0; i < this.allUser.length; i++) {
      const element = this.allUser[i];
      if (element.uid === uid) {
        return element.image;
      }
    }
  }

  /**
   * Toggles the visibility of the emoji selection menu.
   */
  openEmojiSelection() {
    this.emojiselectior = !this.emojiselectior;
  }

  /**
   * Closes the emoji selection menu.
   */
  closeEmojiSelector() {
    this.emojiselectior = false;
  }

  /**
   * Adds a reaction to a message by updating the reaction in the Firestore database.
   * @param {any} reaction - The reaction to add.
   * @param {any} message - The message to react to.
   */
  addReaction(reaction: any, message: any) {
    let src = [
      this.firestore,
      'direcmessages',
      this.user,
      this.messageUser,
      message.id,
    ];
    this.chatAreaService.updateMessageVariable(
      message.id,
      this.authService.currentUserSignal()?.uId,
      reaction,
      src
    );
  }

  /**
   * Retrieves the name of the channel creator based on their user ID.
   * @param {any} uid - User ID of the creator.
   * @returns {string} - Channel creator's name or 'undefined' if not found.
   */
  getChannelCreator(uid: any) {
    if (uid == this.authService.currentUserSignal()?.uId) {
      return 'You own this channel';
    } else {
      if (this.getUser(uid)) {
        return this.getUser(uid).name + ' owns this channel';
      } else {
        return 'undefined';
      }
    }
  }

  /**
   * Edits a message by updating the edited message state and toggling
   * the edit mode for the selected message.
   *
   * @param {any} message - The message object containing the message ID and content.
   */
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

  /**
   * Toggles the visibility of the emoji selector.
   */
  openEmojiSelector() {
    this.emojiSelector = !this.emojiSelector;
  }

  /**
   * Inserts an emoji at the current cursor position in the textarea.
   *
   * @param {any} emoji - The emoji to be inserted into the textarea.
   */
  insertEmoji(emoji: any) {
    const textarea: HTMLTextAreaElement = this.messageTextarea.nativeElement;

    // Current cursor position
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    // Update the value of the textarea
    this.editedMessage =
      textarea.value.substring(0, startPos) +
      emoji +
      textarea.value.substring(endPos, textarea.value.length);

    // Set the cursor position after inserting the text
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = startPos + emoji.length;
    }, 0);
  }

  /**
   * Handles the event of adding an emoji from the emoji selector.
   *
   * @param {any} $event - The event object containing the emoji to insert.
   */
  addEmoji($event: any) {
    let element = $event;
    this.insertEmoji(element['emoji'].native);
  }

  /**
   * Saves the edited message.
   * @param {any} event - The event triggering the save.
   * @param {any} message - The message being edited.
   */
  saveEdit(event: any, message: any) {
    let editedMessage = this.inputChatArea.nativeElement;

    if (
      (editedMessage.innerHTML.length > 0 &&
        editedMessage.textContent.length > 0) ||
      message.fileUrl.length > 0
    ) {
      this.updateMessage(event, message.id);
      this.openEditMessage = '';
    } else {
      this.deleteMessage(message);
    }
  }

  async deleteMessage(message: any) {
    try {
      const messageRef = doc(
        this.firestore,
        'direcmessages',
        this.messageUser,
        this.user,
        message.id
      );
      await deleteDoc(messageRef);
      const messageRef2 = doc(
        this.firestore,
        'direcmessages',
        this.user,
        this.messageUser,
        message.id
      );
      await deleteDoc(messageRef2);
      this.threadService.closeThread();
    } catch (error) {}
  }

  onInputChange(message: any) {
    this.returnEditMessageLengh(message);
  }

  returnEditMessageLengh(message: any) {
    if (this.inputChatArea) {
      const editedMessage = this.inputChatArea.nativeElement;
      if (
        (editedMessage.innerHTML.length > 0 &&
          editedMessage.textContent.length > 0) ||
        message.fileUrl.length > 0
      ) {
        return 'speichern';
      } else {
        return 'Nachricht löschen';
      }
    } else {
      return 'Nachricht löschen';
    }
  }

  /**
   * Updates a message in the Firestore database with the new content.
   *
   * @param {any} event - The event object from the input action.
   * @param {string} messageId - The ID of the message to be updated.
   * @returns {Promise<void>} - A promise that resolves when the update is complete.
   */
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
          // It's a span element, extract the data-uid
          const uid = (child as HTMLElement).getAttribute('data-uid');
          if (uid) {
            // Check the first character of the data-uid
            const firstChar = (child as HTMLElement).innerHTML.charAt(0);
            if (firstChar === '@') {
              result += `₿ЯæŶ∆Ωг${uid} `;
            } else if (firstChar === '#') {
              result += `₣Ж◊ŦΨø℧${uid} `;
            } else {
              // Default case if the first character is neither @ nor #
              result += `${uid} `;
            }
          }
        } else if (child.nodeType === Node.TEXT_NODE) {
          // It's a text node, add the text content
          result += child.textContent;
        }
      });

      // Save the result in the message.message variable
      message = result.trim();
    }

    // Update the message in the Firestore database
    const messageRef = doc(
      this.firestore,
      'direcmessages',
      this.user,
      this.messageUser,
      messageId
    );

    await updateDoc(messageRef, {
      message: message.trim(),
      updatedAt: new Date(), // Optional: store the last modified time
    }).catch((err) => {});

    // Update the message in the Firestore database
    const messageRef2 = doc(
      this.firestore,
      'direcmessages',
      this.messageUser,
      this.user,
      messageId
    );

    await updateDoc(messageRef2, {
      message: message.trim(),
      updatedAt: new Date(), // Optional: store the last modified time
    }).catch((err) => {});
  }

  /**
   * Handles the input event on the message textarea.
   *
   * @param {Event} event - The input event from the textarea.
   */
  onMessageInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.editedMessage = textarea.value;
  }

  /**
   * Checks if the user has reacted to the message.
   *
   * @param {any} id - The ID of the message.
   * @returns {boolean} - Returns true if the user has reacted, otherwise false.
   */
  reacted(id: any): boolean {
    if (id.includes(this.user)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Formats and returns a message with user and channel tags converted into HTML elements.
   * Highlights tags according to whether the current user is the sender.
   *
   * @param {any} message - The original message object containing user and channel tags.
   * @returns {SafeHtml} - The formatted message as safe HTML, with user and channel names highlighted.
   */
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
          <span class="${spanClass}" data-uid="${p1}" contentEditable="false">@${
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
          <span class="${spanClass}" data-uid="${p1}" contentEditable="false">#${
            this.getChannel(p1).name
          }</span>`;
        } else {
          return 'undefined';
        }
      }
    );

    return this.sanitizer.bypassSecurityTrustHtml(modifiedMessage);
  }

  /**
   * Formats a message with editable user and channel tags for message editing purposes.
   *
   * @param {any} message - The message object containing user and channel tags.
   */
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

  /**
   * Inserts formatted HTML content into the chat input area, with a delay until the input area is accessible.
   *
   * @param {any} htmlContent - The HTML string to be inserted into the chat area.
   */
  insertHTML(htmlContent: any) {
    const interval = setInterval(() => {
      if (this.inputChatArea && this.inputChatArea.nativeElement) {
        this.inputChatArea.nativeElement.innerHTML = htmlContent;
        clearInterval(interval);
      }
    }, 100);
  }

  /**
   * Handles click events on tagged elements (user or channel) and opens the corresponding profile or channel view.
   *
   * @param {Event} event - The click event triggered on a tagged element.
   */
  handleClick(event: Event) {
    const target = event.target as HTMLElement;

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

  /**
   * Opens a specified channel, if accessible to the current user.
   *
   * @param {any} uid - The unique identifier for the channel.
   */
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

  /**
   * Opens the profile of a specified user and updates the displayed profile information.
   *
   * @param {any} uid - The unique identifier for the user.
   */
  openUserProfil(uid: any) {
    this.channelInfo.userProfilOpen = true;
    this.channelInfo.activeUserProfil = 0;
    this.channelInfo.activeUser = this.getUser(uid).name;
    this.channelInfo.activeEmail = this.getUser(uid).email;
    this.channelInfo.activeImage = this.getUser(uid).image;
    this.channelInfo.activeUid = uid;
  }

  /**
   * Retrieves the user object based on the provided unique identifier.
   *
   * @param {any} uid - The unique identifier for the user.
   * @returns {object} - The user object, or an object with undefined name if not found.
   */
  getUser(uid: any) {
    for (let i = 0; i < this.allUser.length; i++) {
      const element = this.allUser[i];
      if (element.uid === uid) {
        return element;
      }
    }
    return { name: undefined };
  }

  /**
   * Retrieves the channel object based on the provided unique identifier.
   *
   * @param {any} id - The unique identifier for the channel.
   * @returns {object|undefined} - The channel object, or undefined if not found.
   */
  getChannel(id: any) {
    for (let i = 0; i < this.allChannels.length; i++) {
      const element = this.allChannels[i];
      if (element.id === id) {
        return element;
      }
    }
    return undefined;
  }

  /**
   * Splits a given string by spaces and returns an array of words.
   *
   * @param {string} input - The string to be split.
   * @returns {string[]} - An array of words obtained by splitting the input.
   */
  splitStringBySpace(input: string): string[] {
    return input.split(' ');
  }
}

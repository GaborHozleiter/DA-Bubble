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
import { SearchService } from '../../../services/search.service';

@Component({
  selector: 'app-channel-chat-area',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './channel-chat-area.component.html',
  styleUrls: [
    './channel-chat-area.component.scss',
    './channel-chat-area.component.responsive.scss',
  ],
})
export class ChannelChatAreaComponent implements AfterViewInit, OnInit {
  authService = inject(AuthService);
  searchService = inject(SearchService);

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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  /**
   * Sets the current user ID from the authentication service.
   * @returns {void}
   */
  setOpenUser(): void {
    this.user = this.authService.currentUserSignal()?.uId;
  }

  /**
   * Lifecycle hook that is called after the component has been initialized.
   * Adds a click event listener if the platform is a browser.
   * @returns {void}
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('click', this.handleClick.bind(this));
    }
  }

  /**
   * Lifecycle hook that is called after the component's view has been fully initialized.
   * Subscribes to channel changes, messages, and channel selections, and scrolls to the bottom of the messages container.
   * @returns {void}
   */
  ngAfterViewInit(): void {
    this.channelSelectionService.getSelectedChannel().subscribe((channel) => {
      this.currentChannelId = channel;
      this.subUser();
      this.subMessages();
      this.subChannels();
      setTimeout(() => {
        if (!this.searchService.searching) {
          this.scrollToBottom();
        }
        this.searchService.searching = false;
      }, 10);
    });

    this.messageLoaded.changes.subscribe((t) => {
      if (this.scrolled) {
        this.scrolled = false;
        // this.scrollToBottom();
      }
    });
  }

  /**
   * Sets the selected image for the current channel.
   * @param {any} src - The source URL or data for the image.
   * @returns {void}
   */
  setImg(src: any): void {
    this.channelSelectionService.setSelectedImg(src);
  }

  /**
   * Subscribes to the channels collection in Firestore and updates the list of all channels.
   * @returns {void}
   */
  subChannels(): void {
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
   * Opens a thread and ensures that only one thread can be open at a time.
   * @param {any} thread - The thread to be opened.
   * @returns {void}
   */
  openThread(thread: any): void {
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
   * Subscribes to the messages of the currently selected channel.
   * Updates the list of all messages and sorts them.
   * @returns {void}
   */
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

  /**
   * Subscribes to the users collection in Firestore and updates the list of all users.
   * Sets the current user.
   * @returns {void}
   */
  subUser(): void {
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

  /**
   * Sorts the messages based on date and time in ascending order.
   * @returns {void}
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
      return dateA.getTime() - dateB.getTime(); // Oldest first
    });
  }

  /**
   * Scrolls the messages container to the bottom to show the latest messages.
   */
  scrollToBottom() {
    if (typeof window !== 'undefined') {
      const container = document.getElementById('messageContainer');
      if (container) {
        setTimeout(() => {
          container!.scrollTop = container!.scrollHeight;
        }, 500);
      }
    }
  }

  /**
   * Loads and formats the dates of the sorted messages for display.
   * @returns {void}
   */
  dateLoaded(): void {
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
   * Handles the event when the selected channel changes.
   * Subscribes to the new channel's messages.
   * @param {string} channel - The ID of the new channel.
   * @returns {void}
   */
  onChannelChange(channel: string): void {
    setTimeout(() => {
      this.subMessages(); // Ensure messages are fetched on channel change
    }, 10);
  }

  /**
   * Retrieves the profile image of a user by their UID.
   * @param {any} uid - The UID of the user.
   * @returns {string | undefined} - The URL of the user's profile image or undefined if not found.
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
   * Toggles the visibility of the emoji selector.
   */
  openEmojiSelection() {
    this.emojiselectior = !this.emojiselectior;
  }

  /**
   * Closes the emoji selector.
   */
  closeEmojiSelector() {
    this.emojiselectior = false;
  }

  /**
   * Adds a reaction to a specific message.
   * @param {any} reaction - The reaction to add.
   * @param {any} message - The message to which the reaction is added.
   */
  addReaction(reaction: any, message: any) {
    let src = [
      this.firestore,
      'Channels',
      this.currentChannelId,
      'messages',
      message.id,
    ]; // src can be as long as needed
    this.chatAreaService.updateMessageVariable(
      message.id,
      this.authService.currentUserSignal()?.uId,
      reaction,
      src
    );
  }

  /**
   * Returns the creator of the channel.
   * @param {any} uid - The user ID of the channel creator.
   * @returns {string} - A string indicating who created the channel.
   */
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

  /**
   * Edits a specific message.
   * @param {any} message - The message to edit.
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
   * @param {any} emoji - The emoji to insert.
   */
  insertEmoji(emoji: any) {
    const textarea: HTMLTextAreaElement = this.messageTextarea.nativeElement;

    // Current cursor position
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    // Update the textarea value
    this.editedMessage =
      textarea.value.substring(0, startPos) +
      emoji +
      textarea.value.substring(endPos, textarea.value.length);

    // Set cursor position after inserting the text
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = startPos + emoji.length;
    }, 0);
  }

  /**
   * Handles emoji insertion from the event.
   * @param {any} $event - The event containing the emoji to insert.
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
        'Channels',
        this.currentChannelId,
        'messages',
        message.id
      );
      await deleteDoc(messageRef);
      this.threadService.closeThread();
    } catch (error) {
    }
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
   * Updates a message in the Firestore database.
   * @param {any} event - The event triggering the update.
   * @param {string} messageId - The ID of the message to update.
   * @returns {Promise<void>} - A promise that resolves when the update is complete.
   */
  async updateMessage(event: any, messageId: string): Promise<void> {
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

      // Store the result in the message.message variable
      message = result.trim(); // Example result: "asddasd @zqk0MWq9TcWYUdYtXpTTKsnFro12 sdasad @7gMhlfm1xsVsPe7Hq7kdIPzLMQJ2"
    }

    // Update the message in the Firestore database
    const messageRef = doc(
      this.firestore,
      'Channels',
      this.currentChannelId,
      'messages',
      messageId
    );

    await updateDoc(messageRef, {
      message: message.trim(),
      updatedAt: new Date(), // Optional: Store the last modified timestamp
    }).catch((err) => {});
  }

  /**
   * Handles input changes in the message textarea.
   * @param {Event} event - The input event.
   */
  onMessageInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.editedMessage = textarea.value;
  }

  /**
   * Checks if the user has reacted to the message.
   * @param {any} id - The ID to check for reactions.
   * @returns {boolean} - True if the user has reacted, otherwise false.
   */
  reacted(id: any) {
    if (id.includes(this.user)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Processes and formats a message for display.
   * @param {any} message - The message to process.
   * @returns {SafeHtml} - The processed message as safe HTML.
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

  /**
   * Prepares a message for editing.
   * @param {any} message - The message to prepare for editing.
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
   * Inserts HTML content into the input chat area.
   * @param {any} htmlContent - The HTML content to insert.
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
   * Handles click events on tagged elements.
   * Opens user profile or channel based on the clicked element's class.
   *
   * @param {Event} event - The click event triggered by the user.
   */
  handleClick(event: Event) {
    const target = event.target as HTMLElement;

    // Check if the clicked element is one of the span tags
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
   * Opens a channel for the specified user ID if the current user is a member.
   *
   * @param {any} uid - The user ID of the channel to be opened.
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
   * Opens the user profile for the specified user ID.
   *
   * @param {any} uid - The user ID of the profile to be opened.
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
   * Retrieves user information for the specified user ID.
   *
   * @param {any} uid - The user ID of the user to be retrieved.
   * @returns {{ name: string | undefined }} - The user object containing the name or an object with an undefined name if not found.
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
   * Retrieves channel information for the specified channel ID.
   *
   * @param {any} id - The channel ID to be retrieved.
   * @returns {object | undefined} - The channel object if found; otherwise, undefined.
   */
  getChannel(id: any) {
    for (let i = 0; i < this.allChannels.length; i++) {
      const element = this.allChannels[i];
      if (element.id === id) {
        return element;
      }
    }
    return undefined; // Returned if nothing is found
  }

  /**
   * Splits a string by spaces into an array of substrings.
   *
   * @param {string} input - The input string to be split.
   * @returns {string[]} - An array of substrings split by spaces.
   */
  splitStringBySpace(input: string): string[] {
    return input.split(' ');
  }
}

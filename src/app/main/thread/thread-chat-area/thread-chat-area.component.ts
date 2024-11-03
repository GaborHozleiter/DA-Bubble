import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  inject,
  Input,
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
  selector: 'app-thread-chat-area',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './thread-chat-area.component.html',
  styleUrls: [
    './thread-chat-area.component.scss',
    './thread-chat-area.component.responsive.scss',
  ],
})
export class ThreadChatAreaComponent implements OnInit, AfterViewInit {
  @Input() threadId: any;

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
   * Sets the image source for the selected channel.
   * @param {any} src - The source of the image to be set.
   */
  setImg(src: any) {
    this.channelSelectionService.setSelectedImg(src);
  }

  /**
   * Subscribes to the list of channels from the Firestore database.
   * Updates `allChannels` with the channels and sets the current channel if it matches `currentChannelId`.
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
   * Opens a thread. If a thread is already open, it will close the current thread and open the new one after a short delay.
   * @param {any} thread - The thread to be opened.
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
   * Subscribes to the messages in the current channel's thread from the Firestore database.
   * Updates `allMessages` with the messages and sorts them.
   */
  subMessages() {
    const q = query(
      collection(
        this.firestore,
        'Channels',
        this.currentChannelId,
        'messages',
        this.threadId,
        'thread'
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

  /**
   * Subscribes to the users from the Firestore database.
   * Updates `allUser` with the user data.
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
      this.setOpenUser();
    });
  }

  /**
   * Sorts the messages by date in ascending order.
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
      return dateA.getTime() - dateB.getTime(); // Oldest first, hence reversed
    });
  }

  /**
   * Scrolls the message container to the bottom.
   * This is browser-specific code and is only executed in the browser environment.
   * @returns {boolean} Always returns false.
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
   * Loads dates for sorted messages and marks messages with date indicators.
   * If the date has already been encountered, it does not mark it.
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
   * Handles the channel change event by fetching messages for the new channel.
   * @param {string} channel - The ID of the channel that has been changed.
   * @returns {void}
   */
  onChannelChange(channel: string): void {
    setTimeout(() => {
      this.subMessages(); // Ensure messages are fetched on channel change
    }, 10);
  }

  /**
   * Retrieves the profile image for a user based on their unique ID.
   * @param {any} uid - The unique ID of the user.
   * @returns {string|undefined} - The URL of the user's profile image or undefined if not found.
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
   * @returns {void}
   */
  openEmojiSelection() {
    this.emojiselectior = !this.emojiselectior;
  }

  /**
   * Closes the emoji selector.
   * @returns {void}
   */
  closeEmojiSelector() {
    this.emojiselectior = false;
  }

  /**
   * Adds a reaction to a message.
   * @param {any} reaction - The reaction to be added.
   * @param {any} message - The message to which the reaction is being added.
   * @returns {void}
   */
  addReaction(reaction: any, message: any) {
    let src = [
      this.firestore,
      'Channels',
      this.currentChannelId,
      'messages',
      this.threadId,
      'thread',
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
   * Gets the creator of the current channel.
   * @param {any} uid - The unique ID of the user who created the channel.
   * @returns {string} - A message indicating who created the channel.
   */
  getChannelCreator(uid: any) {
    if (uid == this.authService.currentUserSignal()?.uId) {
      return 'You created this channel';
    } else {
      if (this.getUser(uid)) {
        return this.getUser(uid).name + ' created this channel';
      } else {
        return 'undefined';
      }
    }
  }

  /**
   * Edits a message by toggling the edit state.
   * @param {any} message - The message object to be edited.
   * @returns {void}
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
   * Toggles the visibility of the emoji selector for editing messages.
   * @returns {void}
   */
  openEmojiSelector() {
    this.emojiSelector = !this.emojiSelector;
  }

  /**
   * Inserts an emoji into the message textarea at the cursor's position.
   * @param {any} emoji - The emoji to insert.
   * @returns {void}
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
   * Handles the addition of an emoji from an event.
   * @param {any} $event - The event object containing the emoji.
   * @returns {void}
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
        this.threadId,
        'thread',
        message.id
      );
      await deleteDoc(messageRef);
      this.updateMessageVariable();
    } catch (error) {}
  }

  /**
   * Updates the message variable by updating the thread count and the last thread message time in Firestore.
   * @async
   * @returns {Promise<void>}
   */
  async updateMessageVariable() {
    let value = this.allMessages.length;
    const messageRef = doc(
      this.firestore,
      'Channels',
      this.currentChannelId,
      'messages',
      this.threadId
    );

    try {
      let date =
        this.allMessagesSortedDate[
          this.allMessagesSortedDate.length - 1
        ].hour.toString() +
        ':' +
        this.allMessagesSortedDate[
          this.allMessagesSortedDate.length - 1
        ].minute.toString();


      await updateDoc(messageRef, {
        threadCount: value,
        lastThreadMessage: date,
      });
    } catch (err) {
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
   * @param {any} event - The event triggered by the update action.
   * @param {string} messageId - The ID of the message to be updated.
   * @returns {Promise<void>} - A promise that resolves when the message has been updated.
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
      message = result.trim(); // Example result: "asddasd @zqk0MWq9TcWYUdYtXpTTKsnFro12 sdasad @7gMhlfm1xsVsPe7Hq7kdIPzLMQJ2"
    }

    // Update the message in the Firestore database
    const messageRef = doc(
      this.firestore,
      'Channels',
      this.currentChannelId,
      'messages',
      this.threadId,
      'thread',
      messageId
    );

    await updateDoc(messageRef, {
      message: message.trim(),
      updatedAt: new Date(), // Optional: store the time of the last change
    }).catch((err) => {});
  }

  /**
   * Handles input in the message textarea and updates the editedMessage variable.
   * @param {Event} event - The input event triggered by the textarea.
   * @returns {void}
   */
  onMessageInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.editedMessage = textarea.value;
  }

  /**
   * Checks if the user has reacted to a message.
   * @param {any} id - The ID of the message being checked for reactions.
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
   * Processes a message to highlight users and channels, returning safe HTML.
   * @param {any} message - The message object containing the text to process.
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
   * Prepares a message for editing, replacing user and channel mentions with highlighted spans.
   * @param {any} message - The message object to process.
   * @returns {void}
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
   * The method continuously checks if the input chat area is available
   * and sets its innerHTML to the provided content.
   *
   * @param {any} htmlContent - The HTML content to be inserted into the chat area.
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
   * Handles click events on elements within the chat area.
   * It checks if the clicked element is a span tag with specific classes
   * and opens the user profile or channel based on the element's data-uid attribute.
   *
   * @param {Event} event - The click event object.
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
   * Opens a channel based on the provided uid.
   * Checks if the current user is part of the channel or if the channel
   * id is a specific value, then opens the channel and sets it as selected.
   *
   * @param {any} uid - The unique identifier of the channel to open.
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
   * Opens the user profile for the specified uid.
   * Sets various properties related to the user profile in the channelInfo object.
   *
   * @param {any} uid - The unique identifier of the user whose profile to open.
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
   * Retrieves a user object by its unique identifier.
   *
   * @param {any} uid - The unique identifier of the user to retrieve.
   * @returns {Object} - The user object if found, otherwise an object with name undefined.
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
   * Retrieves a channel object by its unique identifier.
   *
   * @param {any} id - The unique identifier of the channel to retrieve.
   * @returns {Object|undefined} - The channel object if found, otherwise undefined.
   */
  getChannel(id: any) {
    for (let i = 0; i < this.allChannels.length; i++) {
      const element = this.allChannels[i];
      if (element.id === id) {
        return element;
      }
    }
    return undefined; // Returned when nothing is found
  }

  /**
   * Splits a string into an array of substrings based on spaces.
   *
   * @param {string} input - The string to be split.
   * @returns {string[]} - An array of substrings.
   */
  splitStringBySpace(input: string): string[] {
    return input.split(' ');
  }
}

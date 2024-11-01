import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  limit,
  onSnapshot,
  query,
  setDoc,
} from '@angular/fire/firestore';
import { Message } from '../../../../models/message.class';
import { FormsModule } from '@angular/forms';
import { ChannelSelectionService } from '../../../services/channel-selection.service';
import { FileUploadeService } from '../../../services/file-upload.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { AuthService } from '../../../services/auth.service';
import { SidebarService } from '../../../services/sidebar.service';
import { DirectMessageSelectionService } from '../../../services/direct-message-selection.service';

@Component({
  selector: 'app-direct-messages-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent],
  templateUrl: './direct-messages-message-input.component.html',
  styleUrls: [
    './direct-messages-message-input.component.scss',
    './direct-messages-message-input.component.responsive.scss',
  ],
})
export class DirectMessagesMessageInputComponent implements OnInit {
  @Component({
    selector: 'app-channel-message-input',
    standalone: true,
    imports: [CommonModule, FormsModule, PickerComponent],
    templateUrl: './channel-message-input.component.html',
    styleUrls: [
      './channel-message-input.component.scss',
      './channel-message-input.component.responsive.scss',
    ],
  })
  message = new Message();
  weekday: any;
  year: any;
  month: any;
  day: any;
  hour: any;
  minute: any;
  user: any;

  currentChannelId: any;
  currentChannel: any;
  selectedFile: File | null = null;
  FileUrl: any;
  emojiSelector: any = false;
  authService = inject(AuthService);
  allUser: any;
  allUids: any;
  allChannel: any = [];
  allChannelArray: any = [];

  openUser: any;
  userSearch: any;
  channelSearch: any;

  tagUserSelector: boolean = false;
  tagChannelSelector: boolean = false;

  tagedUser: any = [];
  tagedChannel: any = [];
  lastAtPosition: number | null = null;
  showPlaceholder: boolean = false;

  allowMessageSend: boolean = false;
  @ViewChild('textAreaDirectMessage') messageTextarea: any;
  channelInfo = inject(SidebarService);
  sidebarService = inject(SidebarService);

  constructor(
    private firestore: Firestore,
    private channelSelectionService: ChannelSelectionService,
    private fileUploadeService: FileUploadeService,
    public directMessageSelectionService: DirectMessageSelectionService
  ) {}

  //speichert wercher channel gerade ausgewählt ist
  ngOnInit(): void {
    this.user = this.authService.currentUserSignal()?.uId;
    this.channelSelectionService.getSelectedChannel().subscribe((channel) => {
      this.currentChannelId = channel;
      this.subUser();
      this.subChannels();
      this.setOpenUser();
    });
  }

  ngAfterViewInit(): void {
    this.channelSelectionService.getSelectedChannel().subscribe((channel) => {
      this.clearInput();
      this.setFokus();
    });
  }

  setFokus() {
    this.messageTextarea.nativeElement.focus();
  }

  /**
   * Sets the open user based on the selected channel from the direct message selection service.
   * @returns {void}
   */
  setOpenUser() {
    this.user = this.authService.currentUserSignal()?.uId;

    this.directMessageSelectionService
      .getSelectedChannel()
      .subscribe((value) => {
        this.openUser = value;
      });
  }

  /**
   * Clears the input field by removing all text and span elements, and blurs the input div.
   * @returns {void}
   */
  clearInput() {
    if (typeof document !== 'undefined') {
      const div = document.getElementById('input');

      if (div) {
        const childNodes = Array.from(div.childNodes); // Create a copy of the nodes
        for (const node of childNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = ''; // Clear text node
          } else if (node.nodeName === 'SPAN') {
            node.remove(); // Remove span element
          }
        }

        // Remove focus from the input div
        (div as HTMLElement).blur();

        this.showPlaceholder = true;
      }
    }
  }

  /**
   * Hides the placeholder in the input field.
   * @returns {void}
   */
  removePlaceholder() {
    this.showPlaceholder = false;
  }

  /**
   * Restores the placeholder if the message textarea is empty.
   * @returns {void}
   */
  restorePlaceholder() {
    if (this.messageTextarea.nativeElement.innerText.trim() !== '') {
      // Do nothing if there is text
    } else {
      this.showPlaceholder = true;
    }
  }

  /**
   * Saves the selected file to the cache and updates the FileUrl.
   * @returns {Promise<void>}
   */
  async saveFileToCache() {
    if (this.selectedFile) {
      this.allowMessageSend = true;
      const imageUrl = await this.fileUploadeService.uploadFile(
        this.selectedFile,
        'messangeCache'
      );
      this.FileUrl = imageUrl;
    } else {
    }
  }

  /**
   * Deletes the selected file from the cache and resets related variables.
   * @returns {void}
   */
  deleteFile() {
    let name = this.selectedFile!.name;
    this.fileUploadeService.deleteFile(name!, 'messangeCache');
    this.FileUrl = null;
    this.selectedFile = null;
    this.allowMessageSend = false;
  }

  /**
   * Handles the file selection event, deletes the previous file if necessary,
   * and saves the new file to the cache.
   * @param {Event} event - The file selection event.
   * @returns {void}
   */
  onFileSelected(event: any) {
    if (this.FileUrl) {
      this.deleteFile();
    }
    this.selectedFile = event.target.files[0];
    this.saveFileToCache();
  }

  /**
   * Saves the message and related data to Firestore.
   * @param {Event} event - The event that triggered the save action.
   * @returns {Promise<void>}
   */
  async saveMessage(event: any) {
    let messageId = '';

    event?.preventDefault();
    this.tagUserSelector = false;

    // Find the 'contenteditable' div element
    const messageTextarea = document.querySelector(
      '.textAreaDirectMessage'
    ) as HTMLElement;

    if (messageTextarea) {
      const children = messageTextarea.childNodes;
      let result = '';

      children.forEach((child) => {
        if (
          child.nodeType === Node.ELEMENT_NODE &&
          (child as HTMLElement).tagName === 'SPAN'
        ) {
          const uid = (child as HTMLElement).getAttribute('data-uid');
          if (uid) {
            const firstChar = (child as HTMLElement).innerHTML.charAt(0);
            if (firstChar === '@') {
              result += `₿ЯæŶ∆Ωг${uid} `;
            } else if (firstChar === '#') {
              result += `₣Ж◊ŦΨø℧${uid} `;
            } else {
              result += `${uid} `;
            }
          }
        } else if (child.nodeType === Node.TEXT_NODE) {
          result += child.textContent;
        }
      });

      this.message.message = result.trim();
    }

    if (this.message.message.length < 1 && !this.selectedFile) {
      return;
    }

    if (this.selectedFile) {
      await this.saveFile();
      this.addIMG();
      this.deleteFile();
    }

    this.updateDateTime();

    // Save the message for the sender
    const messageRef = doc(
      collection(this.firestore, 'direcmessages', this.user, this.openUser)
    );
    messageId = messageRef.id;

    await setDoc(messageRef, this.toJSON())
      .then(() => {})
      .catch((err) => {});

    // Save the message for the recipient with the same ID
    const recipientRef = doc(
      this.firestore,
      'direcmessages',
      this.openUser,
      this.user,
      messageId
    );

    await setDoc(recipientRef, this.toJSON())
      .then(() => {})
      .catch((err) => {});

    // Clear the input field
    this.clearInput();
    this.tagUserSelector = false;
    this.tagChannelSelector = false;
  }

  /**
   * Uploads the selected file to storage and updates the FileUrl.
   * @returns {Promise<void>}
   */
  async saveFile() {
    if (this.selectedFile) {
      const imageUrl = await this.fileUploadeService.uploadFile(
        this.selectedFile,
        'messangeImages'
      );
      this.FileUrl = imageUrl;
    }
  }

  /**
   * Returns the current message information as a JSON object.
   * @returns {Object} The message data in JSON format.
   */
  toJSON() {
    return {
      id: this.message.id,
      uid: this.message.uid,
      message: this.message.message,
      weekday: this.message.weekday,
      year: this.message.year,
      month: this.message.month,
      day: this.message.day,
      hour: this.message.hour,
      minute: this.message.minute,
      seconds: this.message.seconds,
      milliseconds: this.message.milliseconds,
      fileUrl: this.message.fileUrl,
      fileName: this.message.fileName,
      threadCount: this.message.threadCount,
      thumbsUp: this.message.thumbsUp,
      thumbsDown: this.message.thumbsDown,
      rocket: this.message.rocket,
      nerdFace: this.message.nerdFace,
      noted: this.message.noted,
      shushingFace: this.message.shushingFace,
    };
  }

  /**
   * Updates the message object with the current date and time information.
   * @returns {void}
   */
  updateDateTime(): void {
    const now = new Date();
    this.message.weekday = now.toLocaleDateString('de-DE', { weekday: 'long' });
    this.message.year = now.getFullYear();
    this.message.month = now.getMonth() + 1; // Months are zero-based
    this.message.day = now.getDate();
    this.message.hour = now.getHours();
    this.message.minute = now.getMinutes();
    this.message.seconds = now.getSeconds();
    this.message.milliseconds = now.getMilliseconds(); // Add milliseconds
    this.message.uid = this.authService.currentUserSignal()?.uId;
  }

  /**
   * Adds the file URL to the message object.
   * @returns {void}
   */
  addIMG(): void {
    this.message.fileUrl = this.FileUrl;
  }

  /**
   * Inserts an emoji at the current cursor position in the textarea.
   *
   * @param {any} emoji - The emoji to insert. Can be a native emoji object or a string.
   */
  insertEmoji(emoji: any) {
    // Get the referenced `div` element
    const textarea = this.messageTextarea.nativeElement;

    // Ensure the `div` is focused
    textarea.focus();

    // Get current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    // Get the current range
    const range = selection.getRangeAt(0);

    // Ensure the range is within the `textarea`
    const commonAncestor = range.commonAncestorContainer;
    if (!textarea.contains(commonAncestor)) {
      return;
    }

    // Extract emoji text
    const emojiText = emoji.native || emoji.emoji || emoji;
    if (!emojiText) {
      return;
    }

    // Create a text node for the emoji
    const textNode = document.createTextNode(emojiText);

    // Move the range to the end of the content
    range.selectNodeContents(textarea); // Selects all content in the `div`
    range.collapse(false); // Moves the cursor to the end

    // Insert the text node at the end of the content
    range.insertNode(textNode);

    // Set the cursor directly after the inserted emoji
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);

    // Update the selection
    selection.removeAllRanges();
    selection.addRange(range);

    // Adjust scroll position (optional, if needed)
    textarea.scrollTop = textarea.scrollHeight;
  }

  /**
   * Adds an emoji based on the event triggered.
   *
   * @param {any} $event - The event object containing the emoji to add.
   */
  addEmoji($event: any) {
    let element = $event;
    this.insertEmoji(element['emoji'].native);
  }

  /**
   * Toggles the emoji selector visibility.
   */
  openEmojiSelector() {
    this.emojiSelector = !this.emojiSelector;
  }

  /**
   * Subscribes to user data in Firestore and updates the local user list.
   */
  subUser() {
    const q = query(collection(this.firestore, 'Users'), limit(1000));
    onSnapshot(q, (list) => {
      this.allUser = [];
      list.forEach((element) => {
        this.allUser.push(this.setNoteObjectUser(element.data(), element.id));
      });
    });
  }

  /**
   * Converts a user object from Firestore into a standardized format.
   *
   * @param {any} obj - The user object from Firestore.
   * @param {string} id - The user ID.
   * @returns {object} - The formatted user object.
   */
  setNoteObjectUser(obj: any, id: string) {
    return {
      email: obj.email || '',
      image: obj.image || '',
      name: obj.name || '',
      uid: obj.uid || '',
    };
  }

  /**
   * Subscribes to channel data in Firestore and updates the local channel list.
   */
  subChannels() {
    const q = query(collection(this.firestore, 'Channels'), limit(1000));
    onSnapshot(q, (list) => {
      this.allChannel = [];
      let channel: any;
      list.forEach((element) => {
        channel = this.setNoteChannel(element.data(), element.id);
        this.allChannel.push(channel);

        if (channel.id == this.currentChannelId) {
          this.currentChannel = channel;
          this.allUids = this.currentChannel.uids;
        }
      });
    });
  }

  /**
   * Converts a channel object from Firestore into a standardized format.
   *
   * @param {any} obj - The channel object from Firestore.
   * @param {string} id - The channel ID.
   * @returns {object} - The formatted channel object.
   */
  setNoteChannel(obj: any, id: string) {
    return {
      id: id,
      channelCreator: obj.channelCreator || '',
      description: obj.description || '',
      images: obj.images || '',
      name: obj.name || '',
      uids: obj.uids || '',
    };
  }

  /**
   * Retrieves a user object by UID from the local user list.
   *
   * @param {any} uid - The UID of the user to retrieve.
   * @returns {object | undefined} - The user object or undefined if not found.
   */
  getUser(uid: any) {
    for (let i = 0; i < this.allUser.length; i++) {
      const element = this.allUser[i];
      if (element.uid === uid) {
        return element;
      }
    }
  }

  /**
   * Clears the last tagged user from the input.
   */
  clearTagUser() {
    this.clearTag('@');
  }

  /**
   * Adds a user tag to the input.
   *
   * @param {string} userName - The name of the user to tag.
   * @param {any} uid - The UID of the user to tag.
   */
  addTagUser(userName: string, uid: any) {
    this.addTag('@', userName, uid, this.openUserProfil);
  }

  /**
   * Clears the last tagged channel from the input.
   */
  clearTagChannel() {
    this.clearTag('#');
  }

  /**
   * Adds a channel tag to the input.
   *
   * @param {string} channelName - The name of the channel to tag.
   * @param {any} uid - The UID of the channel to tag.
   */
  addTagChannel(channelName: string, uid: any) {
    this.addTag('#', channelName, uid, this.openChannel);
  }

  /**
   * Clears the last tag of a specified type from the input.
   *
   * @param {string} tagSymbol - The tag symbol to clear ('@' or '#').
   */
  clearTag(tagSymbol: string) {
    const inputElement = document.getElementById('input') as HTMLElement;

    if (!inputElement) {
      return;
    }

    let atIndex = -1;
    let currentIndex = 0;

    inputElement.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const nodeText = node.textContent || '';
        const localAtIndex = nodeText.lastIndexOf(tagSymbol); // `@` or `#`
        if (localAtIndex !== -1) {
          atIndex = currentIndex + localAtIndex;
        }
        currentIndex += nodeText.length;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        currentIndex += (node as HTMLElement).innerText.length;
      }
    });

    if (atIndex !== -1) {
      this.lastAtPosition = atIndex + 1;

      let found = false;
      currentIndex = 0;

      inputElement.childNodes.forEach((node) => {
        if (found) return;

        if (node.nodeType === Node.TEXT_NODE) {
          const nodeText = node.textContent || '';
          if (currentIndex + nodeText.length >= this.lastAtPosition!) {
            const indexInNode = this.lastAtPosition! - currentIndex;

            node.textContent = nodeText.substring(0, indexInNode);
            found = true;
          }
          currentIndex += nodeText.length;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          currentIndex += (node as HTMLElement).innerText.length;
        }
      });

      const range = document.createRange();
      const selection = window.getSelection();
      let lastTextNode =
        inputElement.childNodes[inputElement.childNodes.length - 1];

      if (lastTextNode.nodeType !== Node.TEXT_NODE) {
        lastTextNode = document.createTextNode('');
        inputElement.appendChild(lastTextNode);
      }

      range.setStart(lastTextNode, lastTextNode.textContent!.length);
      range.collapse(true);
      selection!.removeAllRanges();
      selection!.addRange(range);

      if (tagSymbol == '#') {
        this.tagChannelSelector = false;
      } else {
        this.tagUserSelector = false;
      }
    } else {
    }
  }

  /**
   * Adds a tag at the last known position in the input.
   *
   * @param {string} tagSymbol - The tag symbol to use ('@' or '#').
   * @param {string} tag - The name of the tag to add.
   * @param {any} uid - The UID associated with the tag.
   * @param {function} openFunction - A function to call when the tag is clicked.
   */
  addTag(
    tagSymbol: string,
    tag: string,
    uid: any,
    openFunction: (uid: any) => void
  ) {
    const inputElement = document.getElementById('input') as HTMLElement;

    if (!inputElement || this.lastAtPosition === null) {
      return;
    }

    let nodeIndex = 0;
    let found = false;

    inputElement.childNodes.forEach((node) => {
      if (found) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent || '';
        const atPositionInNode = this.lastAtPosition! - 1 - nodeIndex;

        if (nodeIndex + textContent.length >= this.lastAtPosition!) {
          const textBeforeAt = textContent.substring(0, atPositionInNode);
          const textAfterAt = textContent.substring(
            this.lastAtPosition! - nodeIndex
          );

          const span = document.createElement('span');
          span.className = 'tagHighlightInput';
          span.textContent = tagSymbol + tag;
          span.contentEditable = 'false';
          span.setAttribute('data-uid', uid);
          span.addEventListener('click', () => openFunction(uid));

          const afterSpanText = document.createTextNode(textAfterAt);
          const parent = node.parentNode!;

          const beforeSpanText = document.createTextNode(
            textBeforeAt || '\u200B'
          );
          const afterSpanPlaceholder = document.createTextNode('\u200B');

          parent.replaceChild(afterSpanText, node);
          parent.insertBefore(span, afterSpanText);
          parent.insertBefore(beforeSpanText, span);
          parent.insertBefore(afterSpanPlaceholder, afterSpanText);

          span.addEventListener('keydown', function (event) {
            if (event.key === 'Backspace' || event.key === 'Delete') {
              if (
                event.key === 'Backspace' &&
                beforeSpanText.textContent === '\u200B'
              ) {
                parent.removeChild(span);
                event.preventDefault();
              }
              if (
                event.key === 'Delete' &&
                afterSpanPlaceholder.textContent === '\u200B'
              ) {
                parent.removeChild(span);
                event.preventDefault();
              }
            }
          });

          found = true;
        }
        nodeIndex += textContent.length;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        nodeIndex += (node as HTMLElement).innerText.length;
      }
    });

    const range = document.createRange();
    const selection = window.getSelection();
    const lastTextNode =
      inputElement.childNodes[inputElement.childNodes.length - 1];

    range.setStartAfter(lastTextNode);
    range.collapse(true);
    selection!.removeAllRanges();
    selection!.addRange(range);

    this.lastAtPosition = null;
    this.tagChannelSelector = false;
    this.tagUserSelector = false;
  }

  /**
   * Handles the keydown event for the input element.
   * This function processes mentions (@) and channels (#) based on cursor position.
   *
   * @param {KeyboardEvent} event - The keyboard event triggered on key down.
   */
  onKeyDown(event: KeyboardEvent) {
    const inputElement = event.target as HTMLElement;

    setTimeout(() => {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);

      // Calculate the actual cursor position across the entire text content
      let cursorPosition = 0;
      const iterator = document.createNodeIterator(
        inputElement,
        NodeFilter.SHOW_TEXT,
        null
      );
      let currentNode;
      let foundCursor = false;

      while ((currentNode = iterator.nextNode()) && !foundCursor) {
        if (currentNode === range?.startContainer) {
          cursorPosition += range.startOffset;
          foundCursor = true;
        } else {
          cursorPosition += currentNode.textContent?.length || 0;
        }
      }

      // Debugging: Original text in the input element
      const originalText = inputElement.textContent || '';

      this.allowMessageSend = originalText.length > 0;

      // Text without spans
      const text = this.getTextWithoutSpans(inputElement) || '';

      // Find the last @ or # character before the cursor
      let atIndex = text.lastIndexOf('@', cursorPosition - 1);
      let hashIndex = text.lastIndexOf('#', cursorPosition - 1);

      /**
       * Processes mentions (@) or channels (#) based on the index and type.
       *
       * @param {number} index - The index of the mention or channel.
       * @param {'user' | 'channel'} type - The type of tag to process.
       */
      const processTag = (index: number, type: 'user' | 'channel') => {
        let textAfterTag = text.substring(index + 1, cursorPosition);
        const spaceIndex = textAfterTag.search(/\s/);

        const isCursorInTagArea =
          cursorPosition > index &&
          (spaceIndex === -1 || cursorPosition <= index + textAfterTag.length);

        if (isCursorInTagArea) {
          const searchTerm = textAfterTag.toLowerCase();

          if (type === 'user') {
            this.userSearch = searchTerm;
            this.tagUserSelector = true;
            this.tagChannelSelector = false;
            // Search for matching users
            this.allUids = [];
            for (let i = 0; i < this.currentChannel.uids.length; i++) {
              const element = this.currentChannel.uids[i];
              const userName = this.getUser(element).name.toLowerCase();
              if (userName.includes(this.userSearch)) {
                this.allUids.push(element);
              }
            }
          } else if (type === 'channel') {
            this.channelSearch = searchTerm;
            this.tagChannelSelector = true;
            this.tagUserSelector = false;
            // Search for matching channels
            this.allChannelArray = [];
            for (let i = 0; i < this.allChannel.length; i++) {
              const channel = this.allChannel[i];
              const channelName = channel.name.toLowerCase();
              if (
                (channelName.includes(this.channelSearch) &&
                  channel.uids.includes(this.user)) ||
                channel.id == 'wXzgNEb34DReQq3fEsAo7VTcXXNA'
              ) {
                this.allChannelArray.push(channel);
              }
            }
          }
        } else {
          if (type === 'user') {
            this.tagUserSelector = false;
          } else if (type === 'channel') {
            this.tagChannelSelector = false;
          }
        }
      };

      // Check if the cursor is in a @ or # area
      if (atIndex !== -1 && (hashIndex === -1 || atIndex > hashIndex)) {
        processTag(atIndex, 'user');
      } else if (hashIndex !== -1) {
        processTag(hashIndex, 'channel');
      } else {
        this.tagUserSelector = false;
        this.tagChannelSelector = false;
      }
    }, 0);
  }

  /**
   * Gets the text content of an element, excluding any <span> elements.
   *
   * @param {HTMLElement} element - The element from which to extract text.
   * @returns {string} The text content without spans.
   */
  getTextWithoutSpans(element: HTMLElement): string {
    let text = '';
    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName !== 'SPAN') {
          text += this.getTextWithoutSpans(el);
        }
      }
    });
    return text;
  }

  /**
   * Opens the tag user selector when the "@" symbol is used.
   * If "@" is the last character, it removes it; otherwise, it adds it.
   */
  openTag() {
    const inputElement = document.getElementById('input') as HTMLElement;

    if (!inputElement) {
      return;
    }

    // Check if the last character is an @
    const lastChild =
      inputElement.childNodes[inputElement.childNodes.length - 1];
    if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
      if (lastChild.textContent!.endsWith('@')) {
        // Remove @ character
        lastChild.textContent = lastChild.textContent!.slice(0, -1);

        // Optionally remove the empty text node
        if (lastChild.textContent === '') {
          inputElement.removeChild(lastChild);
        }

        // Disable tag user selector
        this.tagUserSelector = false;
      } else {
        // Add @ character
        lastChild.textContent += '@';
        this.tagUserSelector = true;
        this.triggerAtKeyDown(inputElement); // Execute onKeyDown for @
      }
    } else {
      // Add a new @ symbol if there is no last text node
      const atSymbol = document.createTextNode('@');
      inputElement.appendChild(atSymbol);
      this.tagUserSelector = true;
      this.triggerAtKeyDown(inputElement); // Execute onKeyDown for @
    }

    // Set cursor position after the @ symbol if added
    if (this.tagUserSelector) {
      const range = document.createRange();
      const selection = window.getSelection();

      range.setStartAfter(
        inputElement.childNodes[inputElement.childNodes.length - 1]
      );
      range.collapse(true);

      selection!.removeAllRanges();
      selection!.addRange(range);

      // Optionally store the position of the @ symbol for addTagUser function
      this.lastAtPosition = inputElement.innerText.length;
    }
  }

  /**
   * Triggers a keydown event for the "@" symbol.
   *
   * @param {HTMLElement} inputElement - The input element to dispatch the event on.
   */
  triggerAtKeyDown(inputElement: HTMLElement) {
    // Create a keydown event for the @ symbol
    const event = new KeyboardEvent('keydown', {
      key: '@',
      code: 'Digit2', // Default for @ symbol on QWERTZ keyboards
      keyCode: 50, // KeyCode for 2/@
      charCode: 64, // charCode for @
      bubbles: true, // Event can bubble up
      cancelable: true, // Event can be canceled
    });

    // Manually trigger the onKeyDown function
    inputElement.dispatchEvent(event);
  }

  /**
   * Opens the user profile based on the user ID.
   *
   * @param {any} uid - The user ID of the profile to open.
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
   * Opens a channel based on the user ID.
   *
   * @param {any} uid - The user ID of the channel to open.
   */
  openChannel(uid: any) {
    this.channelSelectionService.openChannel();
    this.channelSelectionService.setSelectedChannel(uid);
  }

  /**
   * Logs the provided channel.
   *
   * @param {any} channel - The channel to log.
   * @returns {any} The logged channel.
   */
  log(channel: any): any {
    return channel;
  }
}

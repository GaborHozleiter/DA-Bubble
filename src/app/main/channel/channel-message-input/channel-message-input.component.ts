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
  Firestore,
  limit,
  onSnapshot,
  query,
} from '@angular/fire/firestore';
import { Message } from '../../../../models/message.class';
import { FormsModule } from '@angular/forms';
import { ChannelSelectionService } from '../../../services/channel-selection.service';
import { FileUploadeService } from '../../../services/file-upload.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { AuthService } from '../../../services/auth.service';
import { SidebarService } from '../../../services/sidebar.service';

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
export class ChannelMessageInputComponent implements OnInit, AfterViewInit {
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

  userSearch: any;
  channelSearch: any;

  tagUserSelector: boolean = false;
  tagChannelSelector: boolean = false;

  tagedUser: any = [];
  tagedChannel: any = [];
  lastAtPosition: number | null = null;
  showPlaceholder: boolean = false;
  currentUserId: any;
  allowMessageSend: boolean = false;

  @ViewChild('messageTextarea') messageTextarea: any;
  channelInfo = inject(SidebarService);
  sidebarService = inject(SidebarService);

  constructor(
    private firestore: Firestore,
    private channelSelectionService: ChannelSelectionService,
    private fileUploadeService: FileUploadeService
  ) {}

  /**
   * Initializes the component and subscribes to the selected channel updates.
   */
  ngOnInit(): void {
    this.channelSelectionService.getSelectedChannel().subscribe((channel) => {
      if (channel != this.currentChannelId) {
        this.currentChannelId = channel;
        this.subUser();
        this.subChannels();
        this.clearInput();
        this.setFokus();
      }
    });
  }

  /**
   * After the view has been initialized, clears the input when the selected channel changes
   */
  ngAfterViewInit(): void {}

  setFokus() {
    setTimeout(() => {
      this.messageTextarea.nativeElement.focus();
    }, 100);
  }

  /**
   * Clears the input field by removing all child nodes and blurring the input element.
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
   * Hides the placeholder in the input area.
   */
  removePlaceholder() {
    this.showPlaceholder = false;
  }

  /**
   * Restores the placeholder if the message textarea is empty.
   */
  restorePlaceholder() {
    if (this.messageTextarea.nativeElement.innerText.trim() !== '') {
      // Do nothing if the textarea is not empty
    } else {
      this.showPlaceholder = true;
    }
  }

  /**
   * Saves the selected file to the cache.
   * If no file is selected, logs an error to the console.
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
   * Deletes the selected file from the cache.
   */
  deleteFile() {
    let name = this.selectedFile!.name;
    this.fileUploadeService.deleteFile(name!, 'messangeCache');
    this.FileUrl = null;
    this.selectedFile = null;
    this.allowMessageSend = false;
  }

  /**
   * Handles the event when a file is selected.
   * Deletes the previously selected file and saves the new file to cache.
   *
   * @param {any} event - The event triggered by file selection.
   */
  onFileSelected(event: any) {
    if (this.FileUrl) {
      this.deleteFile();
    }
    const originalFile = event.target.files[0];
    const newFile = new File(
      [originalFile],
      `${Date.now()}.${originalFile.type.split('/')[1]}`,
      {
        type: originalFile.type,
      }
    );

    this.selectedFile = newFile;
    this.saveFileToCache();
  }

  /**
   * Saves the message to the Firestore database.
   *
   * @param {any} event - The event triggered by the form submission.
   * @returns {Promise<void>} - A promise that resolves when the message is saved.
   */
  async saveMessage(event: any) {
    let messageId = '';
    event?.preventDefault();
    this.tagUserSelector = false;

    // Find the 'contenteditable' div element
    const messageTextarea = document.querySelector('.textArea') as HTMLElement;

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
      this.message.message = result.trim(); // Result example: "asddasd @zqk0MWq9TcWYUdYtXpTTKsnFro12 sdasad @7gMhlfm1xsVsPe7Hq7kdIPzLMQJ2"
    }

    if (this.message.message.length < 1 && !this.selectedFile) {
      return; // Exit if there is no message and no file
    }

    // Check if a file is selected and save it
    if (this.selectedFile) {
      await this.saveFile();
      this.addIMG();
      this.deleteFile();
    }

    // Update the time
    this.updateDateTime();

    // Save the message in the Firestore database
    await addDoc(
      collection(this.firestore, 'Channels', this.currentChannelId, 'messages'),
      this.toJSON()
    )
      .then((docRef) => {
        messageId = docRef.id; // Save the message ID
      })
      .catch((err) => {
      });

    await addDoc(
      collection(
        this.firestore,
        'Channels',
        this.currentChannelId,
        'messages',
        messageId,
        'thread'
      ),
      this.toJSON()
    ).catch((err) => {
    });

    // Clear the input
    this.clearInput();
    this.tagUserSelector = false;
    this.tagChannelSelector = false;
  }

  /**
   * Uploads the selected file to storage and saves its URL in the FileUrl variable.
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
   * Returns the existing message information as a JSON object.
   *
   * @returns {Object} - The message data in JSON format.
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
   * Updates the current date and time information in the message object.
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
   */
  addIMG() {
    this.message.fileUrl = this.FileUrl;
  }

  /**
   * Inserts an emoji into the message textarea at the current cursor position.
   *
   * @param {any} emoji - The emoji to insert.
   */
  insertEmoji(emoji: any) {
    // Get the referenced `div` element
    const textarea = this.messageTextarea.nativeElement;

    // Ensure the `div` is focused
    textarea.focus();

    // Get the current selection
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

    // Extract the emoji text
    const emojiText = emoji.native || emoji.emoji || emoji;
    if (!emojiText) {
      return;
    }

    // Create a text node for the emoji
    const textNode = document.createTextNode(emojiText);

    // Set the range to the end of the content
    range.selectNodeContents(textarea); // Selects the entire content of the `div`
    range.collapse(false); // Moves the cursor to the end

    // Insert the text node at the end of the content
    range.insertNode(textNode);

    // Move the cursor directly after the inserted emoji
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);

    // Update the selection
    selection.removeAllRanges();
    selection.addRange(range);

    // Adjust scroll position (optional, if needed)
    textarea.scrollTop = textarea.scrollHeight;
  }

  /**
   * Adds the selected emoji to the message textarea.
   *
   * @param {any} $event - The event triggered by the emoji selection.
   */
  addEmoji($event: any) {
    let element = $event;
    this.insertEmoji(element['emoji'].native);
  }

  /**
   * Toggles the visibility of the emoji selector.
   */
  openEmojiSelector() {
    this.emojiSelector = !this.emojiSelector;
  }

  /**
   * Subscribes to user updates from Firestore and stores them in the allUser array.
   */
  subUser() {
    const q = query(collection(this.firestore, 'Users'), limit(1000));
    onSnapshot(q, (list) => {
      this.allUser = [];
      list.forEach((element) => {
        this.allUser.push(this.setNoteObjectUser(element.data(), element.id));
      });
    });
    this.currentUserId = this.authService.currentUserSignal()?.uId;
  }

  /**
   * Creates a user object from the Firestore data.
   *
   * @param {any} obj - The user data from Firestore.
   * @param {string} id - The user ID.
   * @returns {Object} - The formatted user object.
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
   * Subscribes to channel updates from Firestore and stores them in the allChannel array.
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
   * Creates a channel object from the Firestore data.
   *
   * @param {any} obj - The channel data from Firestore.
   * @param {string} id - The channel ID.
   * @returns {Object} - The formatted channel object.
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
   * Retrieves a user object by its UID from the allUser array.
   *
   * @param {any} uid - The user ID to search for.
   * @returns {Object|undefined} - The user object if found, otherwise undefined.
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
   * Clears the tagging of users.
   */
  clearTagUser() {
    this.clearTag('@');
  }

  /**
   * Adds a tag for a user in the message textarea.
   *
   * @param {string} userName - The name of the user to tag.
   * @param {any} uid - The user ID.
   */
  addTagUser(userName: string, uid: any) {
    this.addTag('@', userName, uid, this.openUserProfil);
  }

  /**
   * Clears the tagging of channels.
   */
  clearTagChannel() {
    this.clearTag('#');
  }

  /**
   * Adds a tag for a channel in the message textarea.
   *
   * @param {string} channelName - The name of the channel to tag.
   * @param {any} uid - The channel ID.
   */
  addTagChannel(channelName: string, uid: any) {
    this.addTag('#', channelName, uid, this.openChannel);
  }

  /**
   * Clears the specified tag from the input.
   *
   * @param {string} tagSymbol - The tag symbol to clear (e.g., '@' or '#').
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
    }
  }

  /**
   * Adds a tag to the input element at the specified position.
   *
   * @param {string} tagSymbol - The symbol associated with the tag (e.g., '@' or '#').
   * @param {string} tag - The text of the tag.
   * @param {any} uid - The unique identifier associated with the tag.
   * @param {function} openFunction - The function to call when the tag is clicked, receiving the uid as a parameter.
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
   * Handles keydown events to determine the cursor position and process tags.
   *
   * @param {KeyboardEvent} event - The keyboard event triggered by the user.
   */
  onKeyDown(event: KeyboardEvent) {
    const inputElement = event.target as HTMLElement;

    setTimeout(() => {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);

      // Calculate the actual cursor position based on the entire text content
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

      if (originalText.length > 0) {
        this.allowMessageSend = true;
      } else {
        this.allowMessageSend = false;
      }

      // Text without spans
      const text = this.getTextWithoutSpans(inputElement) || '';

      // Find the last @ or # character before the cursor
      let atIndex = text.lastIndexOf('@', cursorPosition - 1);
      let hashIndex = text.lastIndexOf('#', cursorPosition - 1);

      // Function to process mentions (@) and channels (#)
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
                  channel.uids.includes(this.currentUserId)) ||
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

      // Check if the cursor is in an @ or # area
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
   * Retrieves text from the given element without span elements.
   *
   * @param {HTMLElement} element - The HTML element from which to retrieve text.
   * @returns {string} The text content without span elements.
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
   * Opens the tag input for a user when the last character is "@".
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
        // Remove the @ symbol
        lastChild.textContent = lastChild.textContent!.slice(0, -1);

        // Optional: Remove the empty text node if there's no text left
        if (lastChild.textContent === '') {
          inputElement.removeChild(lastChild);
        }

        // Disable tag user selector
        this.tagUserSelector = false;
      } else {
        // Add the @ symbol
        lastChild.textContent += '@';
        this.tagUserSelector = true;
        this.triggerAtKeyDown(inputElement); // Execute onKeyDown for @
      }
    } else {
      // Add a new @ symbol if no last text node exists
      const atSymbol = document.createTextNode('@');
      inputElement.appendChild(atSymbol);
      this.tagUserSelector = true;
      this.triggerAtKeyDown(inputElement); // Execute onKeyDown for @
    }

    // Set the cursor after the @ symbol if added
    if (this.tagUserSelector) {
      const range = document.createRange();
      const selection = window.getSelection();

      range.setStartAfter(
        inputElement.childNodes[inputElement.childNodes.length - 1]
      );
      range.collapse(true);

      selection!.removeAllRanges();
      selection!.addRange(range);

      // Optional: Store the position of the @ symbol for addTagUser function
      this.lastAtPosition = inputElement.innerText.length;
    }
  }

  /**
   * Triggers a keydown event for the "@" character in the input element.
   *
   * @param {HTMLElement} inputElement - The HTML element in which to trigger the event.
   */
  triggerAtKeyDown(inputElement: HTMLElement) {
    // Create a keydown event for the @ character
    const event = new KeyboardEvent('keydown', {
      key: '@',
      code: 'Digit2', // Default for QWERTZ keyboards
      keyCode: 50, // KeyCode for 2/@
      charCode: 64, // charCode for @
      bubbles: true, // Event can bubble up
      cancelable: true, // Event can be canceled
    });

    // Manually trigger the onKeyDown function
    inputElement.dispatchEvent(event);
  }

  /**
   * Opens the user profile for the specified user ID.
   *
   * @param {any} uid - The unique identifier for the user whose profile should be opened.
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
   * Opens the channel for the specified channel ID.
   *
   * @param {any} uid - The unique identifier for the channel to be opened.
   */
  openChannel(uid: any) {
    this.channelSelectionService.openChannel();
    this.channelSelectionService.setSelectedChannel(uid);
  }

  /**
   * Logs the specified channel and returns it.
   *
   * @param {any} channel - The channel to log.
   * @returns {any} The logged channel.
   */
  log(channel: any): any {
    return channel;
  }
}

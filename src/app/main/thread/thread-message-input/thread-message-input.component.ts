import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  limit,
  onSnapshot,
  query,
  updateDoc,
} from '@angular/fire/firestore';
import { Message } from '../../../../models/message.class';
import { FormsModule } from '@angular/forms';
import { ChannelSelectionService } from '../../../services/channel-selection.service';
import { FileUploadeService } from '../../../services/file-upload.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { AuthService } from '../../../services/auth.service';
import { SidebarService } from '../../../services/sidebar.service';
import { ChatAreaService } from '../../../services/chat-area.service';

@Component({
  selector: 'app-thread-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent],
  templateUrl: './thread-message-input.component.html',
  styleUrl: './thread-message-input.component.scss',
})
export class ThreadMessageInputComponent implements OnInit {
  @Input() threadId: any;
  allMessages: Message[] = [];

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

  allowMessageSend: boolean = false;
  @ViewChild('ThreadTextArea') messageTextarea: any;
  channelInfo = inject(SidebarService);
  sidebarService = inject(SidebarService);

  constructor(
    private firestore: Firestore,
    private channelSelectionService: ChannelSelectionService,
    private fileUploadeService: FileUploadeService,
    public chatAreaService: ChatAreaService
  ) {}

  //speichert wercher channel gerade ausgewählt ist
  ngOnInit(): void {
    this.channelSelectionService.getSelectedChannel().subscribe((channel) => {
      this.currentChannelId = channel;
      this.subUser();
      this.subChannels();
      this.subMessages();
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
   * Subscribes to messages in the current thread and updates `allMessages` with the latest messages.
   * @returns {void}
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
    });
  }

  /**
   * Clears the input area by removing all text and spans, and blurs the input div.
   * @returns {void}
   */
  clearInput() {
    if (typeof document !== 'undefined') {
      const div = document.getElementById('ThreadInput');

      if (div) {
        const childNodes = Array.from(div.childNodes); // Create a copy of the nodes
        for (const node of childNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = ''; // Clear text nodes
          } else if (node.nodeName === 'SPAN') {
            node.remove(); // Remove span elements
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
      // Do nothing if textarea is not empty
    } else {
      this.showPlaceholder = true;
    }
  }

  /**
   * Saves the selected file to the cache.
   * @async
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
      console.error('No file selected');
    }
  }

  /**
   * Deletes the selected file from the cache.
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
   * Handles the file selection and saves it to the cache.
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
   * Saves the message to the Firestore database and handles file uploads.
   * @async
   * @param {Event} event - The form submission event.
   * @returns {Promise<void>}
   */
  async saveMessage(event: any) {
    let messageId = '';
    event?.preventDefault();
    this.tagUserSelector = false;
    // Find the 'contenteditable' div element
    const messageTextarea = document.querySelector(
      '.ThreadTextArea'
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
            // Check the first character of data-uid
            const firstChar = (child as HTMLElement).innerHTML.charAt(0);
            if (firstChar === '@') {
              result += `₿ЯæŶ∆Ωг${uid} `;
            } else if (firstChar === '#') {
              result += `₣Ж◊ŦΨø℧${uid} `;
            } else {
              // Default case if first character is neither @ nor #
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
      return;
    }
    // Check if a file is selected and save it
    if (this.selectedFile) {
      await this.saveFile();
      this.addIMG();
      this.deleteFile();
    }

    // Update the timestamp
    this.updateDateTime();

    await addDoc(
      collection(
        this.firestore,
        'Channels',
        this.currentChannelId,
        'messages',
        this.threadId,
        'thread'
      ),
      this.toJSON()
    ).catch((err) => {
      console.error(err);
    });

    // Clear the input
    this.clearInput();
    this.tagUserSelector = false;
    this.tagChannelSelector = false;
    this.updateMessageVariable();
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
      await updateDoc(messageRef, {
        threadCount: value,
        lastThreadMessage: this.getCurrentTime(),
      });
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Gets the current time formatted as "HH:MM".
   * @returns {string} The current time in "HH:MM" format.
   */
  getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Uploads the selected file to storage and stores its URL in the `FileUrl` variable.
   * @async
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
   * Returns the existing information as a JSON object.
   * @returns {Object} The message information in JSON format.
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
   * Adds the remaining variables to the message model.
   * @returns {void}
   */
  addIMG() {
    this.message.fileUrl = this.FileUrl;
  }

  /**
   * Inserts an emoji into the message textarea at the current cursor position.
   * @param {Object} emoji - The emoji object containing emoji text.
   * @returns {void}
   */
  insertEmoji(emoji: any) {
    // Get the referenced `div` element
    const textarea = this.messageTextarea.nativeElement;

    // Ensure the `div` is focused
    textarea.focus();

    // Get the current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.error('No valid selection found.');
      return;
    }

    // Get the current range
    const range = selection.getRangeAt(0);

    // Ensure the range is within the `textarea`
    const commonAncestor = range.commonAncestorContainer;
    if (!textarea.contains(commonAncestor)) {
      console.error('Selection is outside the `textarea`.');
      return;
    }

    // Extract emoji text
    const emojiText = emoji.native || emoji.emoji || emoji;
    if (!emojiText) {
      console.error('No valid emoji text found.');
      return;
    }

    // Create a text node for the emoji
    const textNode = document.createTextNode(emojiText);

    // Set the range to the end of the contents
    range.selectNodeContents(textarea); // Select the entire content of the `div`
    range.collapse(false); // Move the cursor to the end

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
   * Adds an emoji to the input based on the event triggered.
   * @param {any} $event - The event object containing the emoji data.
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
   * Subscribes to the 'Users' collection in Firestore and populates allUser with user data.
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
    this.user = this.authService.currentUserSignal()?.uId;
  }

  /**
   * Subscribes to the 'Channels' collection in Firestore and populates allChannel with channel data.
   * Updates the current channel if it matches the currentChannelId.
   */
  subChannels() {
    const q = query(collection(this.firestore, 'Channels'), limit(1000));
    onSnapshot(q, (list) => {
      this.allChannel = [];
      let channel: any;
      list.forEach((element) => {
        channel = this.chatAreaService.setNoteChannel(
          element.data(),
          element.id
        );
        this.allChannel.push(channel);

        if (channel.id == this.currentChannelId) {
          this.currentChannel = channel;
          this.allUids = this.currentChannel.uids;
        }
      });
    });
  }

  /**
   * Retrieves a user object by its unique identifier (uid).
   * @param {any} uid - The unique identifier of the user.
   * @returns {any} The user object if found; otherwise, undefined.
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
   * Clears the last tagged user symbol (@) from the input.
   */
  clearTagUser() {
    this.clearTag('@');
  }

  /**
   * Adds a tagged user to the input field.
   * @param {string} userName - The name of the user to tag.
   * @param {any} uid - The unique identifier of the user to tag.
   */
  addTagUser(userName: string, uid: any) {
    this.addTag('@', userName, uid, this.openUserProfil);
  }

  /**
   * Clears the last tagged channel symbol (#) from the input.
   */
  clearTagChannel() {
    this.clearTag('#');
  }

  /**
   * Adds a tagged channel to the input field.
   * @param {string} channelName - The name of the channel to tag.
   * @param {any} uid - The unique identifier of the channel to tag.
   */
  addTagChannel(channelName: string, uid: any) {
    this.addTag('#', channelName, uid, this.openChannel);
  }

  /**
   * Clears the last tag symbol from the input.
   * @param {string} tagSymbol - The symbol to clear (either '@' or '#').
   */
  clearTag(tagSymbol: string) {
    const inputElement = document.getElementById('ThreadInput') as HTMLElement;

    if (!inputElement) {
      console.error('Das Eingabeelement wurde nicht gefunden.');
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
      console.log(`Kein ${tagSymbol}-Zeichen gefunden.`);
    }
  }

  /**
   * Adds a tagged element to the input based on the tag symbol.
   * @param {string} tagSymbol - The symbol for tagging (either '@' or '#').
   * @param {string} tag - The name of the tag to add.
   * @param {any} uid - The unique identifier of the tagged user or channel.
   * @param {(uid: any) => void} openFunction - The function to call when the tagged element is clicked.
   */
  addTag(
    tagSymbol: string,
    tag: string,
    uid: any,
    openFunction: (uid: any) => void
  ) {
    const inputElement = document.getElementById('ThreadInput') as HTMLElement;

    if (!inputElement || this.lastAtPosition === null) {
      console.error(
        'Das Eingabeelement wurde nicht gefunden oder die Position des Symbols ist unbekannt.'
      );
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
   * Handles key down events in the input field and manages tagging functionality.
   * @param {KeyboardEvent} event - The keyboard event triggered.
   */
  onKeyDown(event: KeyboardEvent) {
    const inputElement = event.target as HTMLElement;

    setTimeout(() => {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);

      // Calculate actual cursor position across the text content
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

      // Debugging: Original text in input element
      const originalText = inputElement.textContent || '';

      if (originalText.length > 0) {
        this.allowMessageSend = true;
      } else {
        this.allowMessageSend = false;
      }

      // Text without spans
      const text = this.getTextWithoutSpans(inputElement) || '';

      // Find the last @ or # symbol before the cursor
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
   * Retrieves the text content of a given HTML element without including any text from <span> elements.
   *
   * @param {HTMLElement} element - The HTML element from which to extract text.
   * @returns {string} - The concatenated text content of the element excluding <span> elements.
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
   * Toggles the opening of a user tag in an input field based on the presence of an '@' symbol.
   * If the last character is '@', it removes it and disables the user selector.
   * If it is not, it adds an '@' symbol and activates the user selector.
   *
   * @returns {void}
   */
  openTag() {
    const inputElement = document.getElementById('ThreadInput') as HTMLElement;

    if (!inputElement) {
      console.error('Das Eingabeelement wurde nicht gefunden.');
      return;
    }

    // Check if the last character is an '@' symbol
    const lastChild =
      inputElement.childNodes[inputElement.childNodes.length - 1];
    if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
      if (lastChild.textContent!.endsWith('@')) {
        // Remove '@' symbol
        lastChild.textContent = lastChild.textContent!.slice(0, -1);

        // Optionally remove empty text node
        if (lastChild.textContent === '') {
          inputElement.removeChild(lastChild);
        }

        // Disable user tag selector
        this.tagUserSelector = false;
      } else {
        // Add '@' symbol
        lastChild.textContent += '@';
        this.tagUserSelector = true;
        this.triggerAtKeyDown(inputElement); // Trigger onKeyDown for '@'
      }
    } else {
      // Add new '@' symbol if no last text node exists
      const atSymbol = document.createTextNode('@');
      inputElement.appendChild(atSymbol);
      this.tagUserSelector = true;
      this.triggerAtKeyDown(inputElement); // Trigger onKeyDown for '@'
    }

    // Set cursor position after the '@' symbol if added
    if (this.tagUserSelector) {
      const range = document.createRange();
      const selection = window.getSelection();

      range.setStartAfter(
        inputElement.childNodes[inputElement.childNodes.length - 1]
      );
      range.collapse(true);

      selection!.removeAllRanges();
      selection!.addRange(range);

      // Optionally save the position of the '@' symbol for addTagUser function
      this.lastAtPosition = inputElement.innerText.length;
    }
  }

  /**
   * Triggers a keydown event for the '@' symbol within the input element.
   *
   * @param {HTMLElement} inputElement - The HTML element to dispatch the keydown event on.
   * @returns {void}
   */
  triggerAtKeyDown(inputElement: HTMLElement) {
    // Create a keydown event for the '@' symbol
    const event = new KeyboardEvent('keydown', {
      key: '@',
      code: 'Digit2', // Default '@' symbol on QWERTZ keyboards
      keyCode: 50, // KeyCode for 2/@
      charCode: 64, // charCode for '@'
      bubbles: true, // Event can bubble up
      cancelable: true, // Event can be canceled
    });

    // Manually trigger the onKeyDown function
    inputElement.dispatchEvent(event);
  }

  /**
   * Opens the user profile for the specified user ID.
   *
   * @param {any} uid - The user ID of the profile to open.
   * @returns {void}
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
   * Opens a channel for the specified user ID.
   *
   * @param {any} uid - The user ID of the channel to open.
   * @returns {void}
   */
  openChannel(uid: any) {
    this.channelSelectionService.openChannel();
    this.channelSelectionService.setSelectedChannel(uid);
  }

  /**
   * Logs the provided channel information.
   *
   * @param {any} channel - The channel to log.
   * @returns {any} - The logged channel information.
   */
  log(channel: any) {
    return channel;
  }
}

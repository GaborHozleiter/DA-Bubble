import { Component, inject } from '@angular/core';
import { SearchService } from '../../../services/search.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChannelSelectionService } from '../../../services/channel-selection.service';
import { SidebarService } from '../../../services/sidebar.service';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ResponsiveService } from '../../../services/responsive.service';

@Component({
  selector: 'app-search-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss', './search-field-responsive.component.scss']
})
export class SearchFieldComponent {
  channels: any[] = [];
  users: any[] = [];
  messages: any[] = [];
  searchTerm: string = '';
  channelSelectionService = inject(ChannelSelectionService);
  hideOrShowSidebar = inject(SidebarService);
  searchService = inject(SearchService);
  authService = inject(AuthService);
  responsiveService = inject(ResponsiveService);
  activeChannelIndex: number | null = null;
  placeholderText = 'Code learning durchsuchen';
  placeholderTextResponsive = 'Gehe zu ...';

  constructor(
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef
  ) { }

  /**
   * Handles the search input and fetches relevant channels, users, and messages based on the search term.
   * Updates the `channels`, `users`, and `messages` arrays with filtered results.
   * @param {Event} event - The input event triggered by the search field.
   */
  async onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.searchTerm.length < 3) {
      this.channels = [];
      this.users = [];
      this.messages = [];
      this.searchService.isSearching = false;
      return;
    } if (this.searchTerm) {
      this.channels = await this.searchService.searchChannels(this.searchTerm);
      this.users = await this.searchService.searchUsers(this.searchTerm);
      const rawMessages = await this.searchService.searchAllChannelMessages(this.searchTerm);
      this.messages = rawMessages.map(message => {
        const username = this.getUsername(message.uid);
        const userImage = this.getUserImage(message.uid);
        return {
          ...message,
          message: this.getMessage(message),
          username: username,
          userImage: userImage,
        };
      });
      this.searchService.isSearching = true;
    } else {
      this.channels = [];
      this.users = [];
      this.messages = [];
      this.searchService.isSearching = false;
    }
  }


  /**
 * Formats the message content, replacing placeholders with user or channel mentions.
 * @param {any} message - The message object.
 * @returns {string} The formatted message with user and channel mentions.
 */
  getMessage(message: any): string {
    // Regex for both user and channel tags
    const userRegex = /₿ЯæŶ∆Ωг(\S+)/g;
    const channelRegex = /₣Ж◊ŦΨø℧(\S+)/g;
    if (!message || !message.message || message.message.length === 0) {
      return message?.message || "";  // Return the original message if invalid
    }
    let modifiedMessage = message.message;
    modifiedMessage = modifiedMessage.replace(
      userRegex,
      (match: any, p1: any) => {
        const username = this.getUsername(p1);
        if (username) {
          return `<b class="tagHighlight">@${username}</b>`;
        } return match;
      }
    );
    modifiedMessage = modifiedMessage.replace(
      channelRegex,
      (match: any, p1: any) => {
        const channelName = this.getChannelName(p1);
        if (channelName) {
          return `<b class="tagHighlight">#${channelName}</b>`;
        }
        return match;  // Return the original match if channel name not found
      }
    );
    return modifiedMessage;
  }


  /**
   * Retrieves the username corresponding to a given user ID.
   * @param {string} uid - The user ID.
   * @returns {string} The username associated with the given user ID.
   */
  getUsername(uid: string): string {
    const index = this.hideOrShowSidebar.AllUids.indexOf(uid);
    return index !== -1 ? this.hideOrShowSidebar.AllUsers[index] : 'Unknown User';
  }

  /**
 * Retrieves the channel name corresponding to a given channel ID.
 * @param {string} cid - The channel ID.
 * @returns {string} The channel name associated with the given channel ID.
 */
  getChannelName(cid: string): string {
    const index = this.hideOrShowSidebar.AllChannelsIds.indexOf(cid);
    return index !== -1 ? this.hideOrShowSidebar.AllChannels[index] : 'Unknown Channel';
  }

  /**
   * Retrieves the user image URL corresponding to a given user ID.
   * @param {string} uid - The user ID.
   * @returns {string} The URL of the user's profile image.
   */
  getUserImage(uid: string): string {
    const index = this.hideOrShowSidebar.AllUids.indexOf(uid);
    return index !== -1 ? this.hideOrShowSidebar.AllImages[index] : 'default-image-url';
  }

  /**
   * Highlights the search term in the provided text.
   * @param {string} text - The text to highlight the search term in.
   * @returns {SafeHtml} The text with highlighted search terms.
   */
  highlight(text: string): SafeHtml {
    if (!this.searchTerm) return text;
    const regex = new RegExp(`(${this.searchTerm})`, 'gi');
    const highlightedText = text.replace(regex, `<span class="highlight">$1</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }

  /**
   * Handles the event when a channel is clicked.
   * Selects and activates the clicked channel if the user is a member of the channel.
   * @param {string} channelId - The ID of the clicked channel.
   */
  onChannelClick(channelId: string) {
    const channelIndex = this.hideOrShowSidebar.AllChannelsIds.findIndex((id, index) => {
      return id === channelId &&
        (this.hideOrShowSidebar.GlobalChannelUids[index].includes(this.authService.currentUserSignal()?.uId ?? '')
          || this.hideOrShowSidebar.AllChannelsIds[index] === 'wXzgNEb34DReQq3fEsAo7VTcXXNA');
    });
    if (channelIndex !== -1) {
      this.channelActive(channelIndex);
      this.searchService.isSearching = false;
      this.responsiveService.isChannelOpen = true;
      if (window.innerWidth < 1000) {
        this.responsiveService.isSidebarOpen = false;
      }
    } else {
      console.error('Kanal nicht gefunden oder Benutzer ist kein Mitglied:', channelId);
    }
  }

  /**
   * Handles the event when a user is clicked.
   * Activates the clicked user's profile if found.
   * @param {string} userId - The ID of the clicked user.
   */
  onUserClick(userId: string) {
    const userIndex = this.hideOrShowSidebar.AllUids.findIndex(uid => uid === userId);
    if (userIndex !== -1) {
      this.userActive(userIndex);
      this.searchService.isSearching = false;
    } else {
      console.log('User not found with ID:', userId);
    }
  }

  /**
   * Handles the event when a message is clicked.
   * Navigates to the channel containing the message and scrolls to the specific message.
   * @param {string} channelId - The ID of the channel containing the message.
   * @param {string} messageId - The ID of the clicked message.
   */
  onMessageClick(channelId: string, messageId: string) {
    const channelIndex = this.hideOrShowSidebar.AllChannelsIds.findIndex((channel, index) => {
      return channel === channelId &&
        (this.hideOrShowSidebar.GlobalChannelUids[index].includes(this.authService.currentUserSignal()?.uId ?? '')
          || this.hideOrShowSidebar.AllChannelsIds[index] === 'wXzgNEb34DReQq3fEsAo7VTcXXNA');
    });
    if (channelIndex !== -1) {
      this.searchService.isSearching = false;
      this.channelActive(channelIndex);
      this.scrollToMessage(messageId);
      this.responsiveService.isChannelOpen = true;
      if (window.innerWidth < 1000) {
        this.responsiveService.isSidebarOpen = false;
      }
    } else {
      console.error('Kanal nicht gefunden oder Benutzer ist kein Mitglied:', channelId);
    }
  }

  /**
   * Scrolls smoothly to the specified message in the view.
   * @param {string} messageId - The ID of the message to scroll to.
   */
  scrollToMessage(messageId: string) {
    setTimeout(() => {
      const messageElement = document.getElementById(messageId);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.log('Message element not found with ID:', messageId);
      }
    }, 500);
  }

  /**
   * Activates the selected channel and updates the UI accordingly.
   * @param {number} i - The index of the channel to activate.
   */
  channelActive(i: number) {
    this.channelSelectionService.openChannel();
    this.hideOrShowSidebar.activeChannelIndex = this.hideOrShowSidebar.AllChannels.length - 1 - i;
    this.channelSelectionService.setSelectedChannel(this.hideOrShowSidebar.AllChannelsIds[i]);
    this.hideOrShowSidebar.currentChannelNumber = i;
    this.cdRef.detectChanges();
  }

  /**
   * Activates the selected user's profile and updates the UI.
   * @param {number} i - The index of the user to activate.
   */
  userActive(i: number) {
    this.hideOrShowSidebar.activeUserIndex = i;
    this.hideOrShowSidebar.userProfilOpen = true;
    this.hideOrShowSidebar.activeUser = this.hideOrShowSidebar.AllUsers[i];
    this.hideOrShowSidebar.activeEmail = this.hideOrShowSidebar.AllEmails[i];
    this.hideOrShowSidebar.activeImage = this.hideOrShowSidebar.AllImages[i];
    this.hideOrShowSidebar.activeUid = this.hideOrShowSidebar.AllUids[i];
  }
}





import { inject, Injectable } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { Channel } from '../../models/channel';
import { SidebarService } from './sidebar.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  hideOrShowSidebar = inject(SidebarService);
  isSearching: boolean = false;
  constructor(private firestore: Firestore) {}

  hideSearch() {
    this.isSearching = false;
  }

  /**
   * Searches for channels based on the given search term.
   * Filters channels whose names match the search term (case-insensitive).
   * @param {string} searchTerm - The search term to filter channels by.
   * @returns {Promise<Channel[]>} A promise that resolves to a list of filtered channels.
   */
  async searchChannels(searchTerm: string): Promise<Channel[]> {
    const normalizedTerm = searchTerm.toLowerCase();
    const channelsRef = collection(this.firestore, 'Channels');
    const querySnapshot = await getDocs(channelsRef);
    const filteredChannels = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        name: doc.data()['name'],
        uids: doc.data()['uids']
      }))
      .filter(channel => channel.name.toLowerCase().includes(normalizedTerm));
    return filteredChannels;
  }
  
  /**
   * Searches all messages across all channels for a specific term.
   * Filters messages that contain the search term (case-insensitive).
   * @param {string} searchTerm - The search term to filter messages by.
   * @returns {Promise<any[]>} A promise that resolves to a list of filtered messages.
   */
  async searchAllChannelMessages(searchTerm: string): Promise<any[]> {
    const normalizedTerm = searchTerm.toLowerCase();
    const filteredMessages = [];
    const channelsRef = collection(this.firestore, 'Channels');
    const channelsSnapshot = await getDocs(channelsRef);
    for (const channelDoc of channelsSnapshot.docs) {
      const channelId = channelDoc.id;
      const messagesRef = collection(this.firestore, `Channels/${channelId}/messages`);
      const messagesSnapshot = await getDocs(messagesRef);
      for (const messageDoc of messagesSnapshot.docs) {
        const messageData = messageDoc.data();
        if (messageData['message'] && messageData['message'].toLowerCase().includes(normalizedTerm)) {
          filteredMessages.push({
            id: messageDoc.id,
            channelId: channelId,
            message: messageData['message'],
            uid: messageData['uid'],
          });
        }
      }
    }
    return filteredMessages;
  }
  
  /**
   * Retrieves all messages for a specific channel.
   * @param {string} channelId - The ID of the channel.
   * @returns {Promise<any[]>} A promise that resolves to a list of messages for the specified channel.
   */
  async getMessagesForChannel(channelId: string): Promise<any[]> {
    const messagesRef = collection(this.firestore, `Channels/${channelId}/messages`);
    const querySnapshot = await getDocs(messagesRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      text: doc.data()['message'],
    }));
  }
  
  /**
   * Searches for users based on the given search term.
   * Filters users whose names match the search term (case-insensitive).
   * @param {string} searchTerm - The search term to filter users by.
   * @returns {Promise<any[]>} A promise that resolves to a list of filtered users.
   */
  async searchUsers(searchTerm: string): Promise<any[]> {
    const normalizedTerm = searchTerm.toLowerCase();
    const filteredUsers = [];
    for (let i = 0; i < this.hideOrShowSidebar.AllUsers.length; i++) {
      const userName = this.hideOrShowSidebar.AllUsers[i].toLowerCase();
      if (userName.includes(normalizedTerm)) {
        filteredUsers.push({
          uid: this.hideOrShowSidebar.AllUids[i],
          name: this.hideOrShowSidebar.AllUsers[i],
          email: this.hideOrShowSidebar.AllEmails[i],
          image: this.hideOrShowSidebar.AllImages[i],
        });
      }
    }
    return filteredUsers;
  }
}

import { inject, Injectable } from '@angular/core';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ChatAreaService {
  authService = inject(AuthService);

  constructor() {}

  /**
   * Sets up a note object with the provided properties.
   * @param {any} obj - The object containing note details.
   * @param {string} id - The unique identifier for the note.
   * @returns {Object} The structured note object.
   */
  setNoteObject(obj: any, id: string) {
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
      lastThreadMessage: obj.lastThreadMessage || '',
      checkMark: obj.checkMark || '',
      handshake: obj.handshake || '',
      thumbsUp: obj.thumbsUp || '',
      thumbsDown: obj.thumbsDown || '',
      rocket: obj.rocket || '',
      nerdFace: obj.nerdFace || '',
      noted: obj.noted || '',
      shushingFace: obj.shushingFace || '',
    };
  }

  /**
   * Sets up a note channel object with the provided properties.
   * @param {any} obj - The object containing channel details.
   * @param {string} id - The unique identifier for the channel.
   * @returns {Object} The structured note channel object.
   */
  setNoteChannel(obj: any, id: string) {
    return {
      id: id,
      channelCreatorUid: obj.channelCreatorUid || '',
      creationsDate: obj.creationsDate || '',
      description: obj.description || '',
      images: obj.images || '',
      name: obj.name || '',
      uids: obj.uids || '',
    };
  }

  /**
   * Sets up a note object for a user with the provided properties.
   * @param {any} obj - The object containing user details.
   * @param {string} id - The unique identifier for the user.
   * @returns {Object} The structured user object for the note.
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
   * Retrieves the name of the month for a given month number.
   * @param {number} monthNumber - The month number (1-12).
   * @returns {string} The name of the month.
   * @throws Will throw an error if the month number is invalid.
   */
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

  /**
   * Formats the given hour and minute into a readable time string.
   * @param {any} hour - The hour to format.
   * @param {any} minute - The minute to format.
   * @returns {any} The formatted time string.
   */
  getFormattedTime(hour: any, minute: any): any {
    const hours = hour.toString().padStart(2, '0');
    const minutes = minute.toString().padStart(2, '0');
    return `${hours}:${minutes} Uhr`;
  }

  /**
   * Updates a specified variable in a message document in Firestore.
   * @param {any} messageId - The identifier of the message.
   * @param {any} newValue - The new value to be updated.
   * @param {any} variableName - The name of the variable to update.
   * @param {any} src - The source path to the Firestore document.
   * @returns {Promise<void>} A promise indicating the completion of the update.
   */
  async updateMessageVariable(
    messageId: any,
    newValue: any,
    variableName: any,
    src: any
  ) {
    const [firestoreInstance, ...pathSegments] = src;

    const messageRef = doc(firestoreInstance, ...pathSegments);
    try {
      // Get the current value of the variable
      const messageSnapshot = await getDoc(messageRef);
      if (messageSnapshot.exists()) {
        // Typisieren des zurückgegebenen Objekts als ein einfaches Dictionary
        const currentData = messageSnapshot.data() as { [key: string]: any };

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
    } catch (err) {
    }
  }

  /**
   * Gets a human-readable date string based on the provided timestamp.
   * @param {number} timestamp - The timestamp to convert.
   * @returns {string} A string indicating if the date is today or formatted date.
   */
  getDate(timestamp: number) {
    const givenDate = new Date(timestamp);
    const today = new Date();

    if (
      givenDate.getDate() === today.getDate() &&
      givenDate.getMonth() === today.getMonth() &&
      givenDate.getFullYear() === today.getFullYear()
    ) {
      return 'heute';
    } else {
      return 'am ' + this.formatDate(timestamp);
    }
  }

  /**
   * Formats a timestamp into a string representation of the date.
   * @param {number} timestamp - The timestamp to format.
   * @returns {string} The formatted date string in 'DD.MM.YYYY' format.
   */
  formatDate(timestamp: number): string {
    const givenDate = new Date(timestamp);

    const day = String(givenDate.getDate()).padStart(2, '0'); // Tag mit führender Null
    const month = String(givenDate.getMonth() + 1).padStart(2, '0'); // Monat mit führender Null (getMonth ist nullbasiert, daher +1)
    const year = givenDate.getFullYear(); // Jahr

    return `${day}.${month}.${year}`;
  }

  /**
   * Checks if the specified reaction exists in the message.
   * @param {any} message - The message object to check.
   * @param {string} reactionName - The name of the reaction to check for.
   * @returns {boolean} True if the reaction exists, otherwise false.
   */
  hasReaction(message: any, reactionName: string): boolean {
    return message[reactionName] && message[reactionName].length > 0;
  }

  /**
   * Checks if the current user has reacted to the message with the specified reaction.
   * @param {any} message - The message object to check.
   * @param {string} reactionName - The name of the reaction to check for.
   * @returns {boolean} True if the user has reacted, otherwise false.
   */
  hasUserReacted(message: any, reactionName: string): boolean {
    const userId = this.authService.currentUserSignal()?.uId;
    return message[reactionName]?.split(' ').includes(userId);
  }

  /**
   * Gets the count of reactions of a specified type on the message.
   * @param {any} message - The message object to check.
   * @param {string} reactionName - The name of the reaction to count.
   * @returns {number} The count of reactions.
   */
  getReactionCount(message: any, reactionName: string): number {
    const reactions = message[reactionName];
    if (reactions) {
      return reactions.split(' ').length;
    }
    return 0;
  }

  /**
   * Counts the number of words in a given input string.
   * @param {string} input - The input string to analyze.
   * @returns {number} The number of words in the input.
   */
  splitWords(input: string) {
    if (input) {
      let words = input.trim().split(/\s+/).length;
      return words;
    } else {
      return 0;
    }
  }

  /**
   * Checks if the message date is today.
   * @param {any} message - The message object containing date details.
   * @returns {boolean} True if the message date is not today, otherwise false.
   */
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
}

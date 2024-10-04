import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  setDoc,
} from '@angular/fire/firestore';
import { Message } from '../../../../models/message.class';
import { FormsModule } from '@angular/forms';
import { ChannelSelectionService } from '../../../services/channel-selection.service';
import { FileUploadeService } from '../../../services/file-upload.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { AuthService } from '../../../services/auth.service';
import { DirectMessageSelectionService } from '../../../services/direct-message-selection.service';
import { SidebarService } from '../../../services/sidebar.service';
import { DirectMessage } from '../../../../models/direct-message.class';
import { NewMessageSelectionService } from '../../../services/new-message-selection.service';

@Component({
  selector: 'app-new-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent],
  templateUrl: './new-message-input.component.html',
  styleUrl: './new-message-input.component.scss',
})
export class NewMessageInputComponent {
  message = new Message();
  directMessage = new DirectMessage();

  weekday: any;
  year: any;
  month: any;
  day: any;
  hour: any;
  minute: any;
  user: any;

  selectedFile: File | null = null;
  FileUrl: any;
  emojiSelector: any = false;
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
  selectedChannel: any;
  selecteduid: any;

  @ViewChild('messageTextarea') messageTextarea: any;

  constructor(
    private firestore: Firestore,
    private fileUploadeService: FileUploadeService,
    public directMessageSelectionService: DirectMessageSelectionService,
    public newMessageSelectionService: NewMessageSelectionService,
    public channelSelectionService: ChannelSelectionService
  ) {}

  //speichert wercher channel gerade ausgewählt ist
  ngOnInit(): void {
    this.newMessageSelectionService.getselectedChannel().subscribe((data) => {
      this.selectedChannel = data;
    });
    this.newMessageSelectionService.getselecteduid().subscribe((data) => {
      this.selecteduid = data;
    });
  }

  //speichert die bilder in den cache
  async saveFileToCache() {
    if (this.selectedFile) {
      const imageUrl = await this.fileUploadeService.uploadFile(
        this.selectedFile,
        'messangeCache'
      );
      this.FileUrl = imageUrl;
    } else {
      console.error('No file selected');
    }
  }

  //löscht die bilder aus den cache
  deleteFile() {
    let name = this.selectedFile!.name;
    this.fileUploadeService.deleteFile(name!, 'messangeCache');
    this.FileUrl = null;
    this.selectedFile = null;
  }

  //läd die bilder in den cache wenn sie ausgewählt wurde
  onFileSelected(event: any) {
    if (this.FileUrl) {
      this.deleteFile();
    }
    this.selectedFile = event.target.files[0];
    this.saveFileToCache();
  }

  saveMessage() {
    if (this.selectedChannel == 'user') {
      this.saveDirectMessage();
      this.channelSelectionService.openDirectMessage();
      this.directMessageSelectionService.setSelectedChannel(this.selecteduid);
    } else if (this.selectedChannel == 'channel') {
      this.saveChannelMessage();
      this.channelSelectionService.openChannel();
      this.channelSelectionService.setSelectedChannel(this.selecteduid);
    } else {
      console.log('no channel selected');
    }
  }

  //erstannt eine nachricht
  async saveChannelMessage() {
    if (this.selectedFile) {
      await this.saveFile();
      this.addIMG();
      this.deleteFile();
    }

    this.updateDateTime();
    await addDoc(
      collection(this.firestore, 'Channels', this.selecteduid, 'messages'),
      this.toJSON()
    ).catch((err) => {
      console.error(err);
    });
    this.message.message = '';
  }

  //wenn ein bild ausgewählt ist wird diese ins storage hochgeladen und dessen url in der variable FileUrl gespeichert
  async saveFile() {
    if (this.selectedFile) {
      const imageUrl = await this.fileUploadeService.uploadFile(
        this.selectedFile,
        'messangeImages'
      );
      this.FileUrl = imageUrl;
    }
  }

  //gibt die vorhandenen informationen als JSON zurück
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

  //erstellt die daten der aktuellen zeit
  updateDateTime(): void {
    const now = new Date();
    this.message.weekday = now.toLocaleDateString('de-DE', { weekday: 'long' });
    this.message.year = now.getFullYear();
    this.message.month = now.getMonth() + 1; // Monate sind nullbasiert
    this.message.day = now.getDate();
    this.message.hour = now.getHours();
    this.message.minute = now.getMinutes();
    this.message.seconds = now.getSeconds();
    this.message.milliseconds = now.getMilliseconds(); // Millisekunden hinzufügen
    this.message.uid = this.authService.currentUserSignal()?.uId;
  }

  //fügt die restlichen variablen ins model
  addIMG() {
    this.message.fileUrl = this.FileUrl;
    this.message.fileName = this.selectedFile?.name;
  }

  insertEmoji(emoji: any) {
    const textarea: HTMLTextAreaElement = this.messageTextarea.nativeElement;

    // Aktuelle Position des Cursors
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    // Wert des Textarea-Felds aktualisieren
    this.message.message =
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

  openEmojiSelector() {
    this.emojiSelector = !this.emojiSelector;
  }

  updateSelectedUser() {
    this.directMessageSelectionService.setSelectedChannel(
      this.sidebarService.activeUid
    );
    this.sidebarService.userProfilOpen = false;
  }
  //erstannt eine nachricht
  async saveDirectMessage() {
    this.user = this.authService.currentUserSignal()?.uId;
    if (this.selectedFile) {
      await this.saveFile();
      this.addIMGDirectMessage();
      this.deleteFile();
    }

    this.updateDateTimeDirectMessage();
    this.directMessage.communicationType = 'send';

    // Generiere die Dokument-ID
    const messageRef = doc(
      collection(this.firestore, 'direcmessages', this.user, this.selecteduid)
    );
    const messageId = messageRef.id;

    // Speichere die Nachricht mit der generierten ID für den Sender
    await setDoc(messageRef, this.directMessageToJson()).catch((err) => {
      console.error(err);
    });

    this.directMessage.communicationType = 'resive';

    // Speichere die Nachricht mit der gleichen ID für den Empfänger
    const recipientRef = doc(
      this.firestore,
      'direcmessages',
      this.selecteduid,
      this.user,
      messageId
    );
    await setDoc(recipientRef, this.directMessageToJson()).catch((err) => {
      console.error(err);
    });

    this.message.message = '';
    this.directMessage.communicationType = '';
  }

  //gibt die vorhandenen informationen als JSON zurück
  directMessageToJson() {
    return {
      id: this.directMessage.id,
      uid: this.directMessage.uid,
      message: this.directMessage.message,
      weekday: this.directMessage.weekday,
      year: this.directMessage.year,
      month: this.directMessage.month,
      day: this.directMessage.day,
      hour: this.directMessage.hour,
      minute: this.directMessage.minute,
      seconds: this.directMessage.seconds,
      milliseconds: this.directMessage.milliseconds,
      fileUrl: this.directMessage.fileUrl,
      fileName: this.directMessage.fileName,
      threadCount: this.directMessage.threadCount,
      thumbsUp: this.directMessage.thumbsUp,
      thumbsDown: this.directMessage.thumbsDown,
      rocket: this.directMessage.rocket,
      nerdFace: this.directMessage.nerdFace,
      noted: this.directMessage.noted,
      shushingFace: this.directMessage.shushingFace,
      communicationType: this.directMessage.communicationType,
    };
  }

  addIMGDirectMessage() {
    this.directMessage.fileUrl = this.FileUrl;
    this.directMessage.fileName = this.selectedFile?.name;
  }

  updateDateTimeDirectMessage(): void {
    const now = new Date();
    this.directMessage.weekday = now.toLocaleDateString('de-DE', {
      weekday: 'long',
    });
    this.directMessage.year = now.getFullYear();
    this.directMessage.month = now.getMonth() + 1; // Monate sind nullbasiert
    this.directMessage.day = now.getDate();
    this.directMessage.hour = now.getHours();
    this.directMessage.minute = now.getMinutes();
    this.directMessage.seconds = now.getSeconds();
    this.directMessage.milliseconds = now.getMilliseconds(); // Millisekunden hinzufügen
    this.directMessage.uid = this.authService.currentUserSignal()?.uId;
  }
}

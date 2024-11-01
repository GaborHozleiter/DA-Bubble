import { Component, inject, Input, OnInit } from '@angular/core';
import { ThreadMessageInputComponent } from '../thread-message-input/thread-message-input.component';
import { ThreadChatAreaComponent } from '../thread-chat-area/thread-chat-area.component';
import { ThreadHeaderComponent } from '../thread-header/thread-header.component';
import {
  addDoc,
  collection,
  Firestore,
  limit,
  onSnapshot,
  query,
} from '@angular/fire/firestore';
import { Message } from '../../../../models/message.class';
import { ResponsiveService } from '../../../services/responsive.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    ThreadMessageInputComponent,
    ThreadChatAreaComponent,
    ThreadHeaderComponent,
  ],
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss', './thread-responsive.component.scss'],
})
export class ThreadComponent implements OnInit {
  @Input() thread: any;
  threadId: any;
  allMessagesSorted: Message[] = [];
  allMessages: Message[] = [];
  allDates: any = [];
  dateCounter = 0;
  responsiveService = inject(ResponsiveService);

  constructor(private firestore: Firestore) {}
  ngOnInit(): void {
    this.threadId = this.thread.id;
  }
}

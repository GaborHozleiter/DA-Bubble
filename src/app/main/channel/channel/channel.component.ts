import { Component, inject, OnInit } from '@angular/core';
import { ChannelHeaderComponent } from '../channel-header/channel-header.component';
import { ChannelChatAreaComponent } from '../channel-chat-area/channel-chat-area.component';
import { ChannelMessageInputComponent } from '../channel-message-input/channel-message-input.component';
import { ThreadComponent } from '../../thread/thread/thread.component';
import { CommonModule } from '@angular/common';
import { ThreadService } from '../../../services/thread.service';
import { ChannelSelectionService } from '../../../services/channel-selection.service';
import { ResponsiveService } from '../../../services/responsive.service';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [
    ChannelHeaderComponent,
    ChannelChatAreaComponent,
    ChannelMessageInputComponent,
    ThreadComponent,
    CommonModule,
  ],
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss', './channel-responsive.component.scss']
})
export class ChannelComponent {
  currentThread: any;
  currentChannel: any;
  ThreadAnimation: any;
  responsiveService = inject(ResponsiveService);

  constructor(private threadService: ThreadService) {
    this.threadService.currentThread$.subscribe((thread) => {
      this.currentThread = thread;
    });
    this.threadService.ThreadAnimation$.subscribe((thread) => {
      this.ThreadAnimation = thread;
    });
  }
}

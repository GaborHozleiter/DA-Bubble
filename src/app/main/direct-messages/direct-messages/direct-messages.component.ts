import { Component, inject, OnInit } from '@angular/core';
import { DirectMessageSelectionService } from '../../../services/direct-message-selection.service';
import { DirectMessagesHeaderComponent } from '../direct-messages-header/direct-messages-header.component';
import { DirectMessagesChatAreaComponent } from '../direct-messages-chat-area/direct-messages-chat-area.component';
import { DirectMessagesMessageInputComponent } from '../direct-messages-message-input/direct-messages-message-input.component';
import { ResponsiveService } from '../../../services/responsive.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-direct-messages',
  standalone: true,
  imports: [
    DirectMessagesHeaderComponent,
    DirectMessagesChatAreaComponent,
    DirectMessagesMessageInputComponent,
    CommonModule
  ],
  templateUrl: './direct-messages.component.html',
  styleUrl: './direct-messages.component.scss',
})
export class DirectMessagesComponent implements OnInit {
  user: any;
  responsiveService = inject(ResponsiveService);

  constructor(
    public directMessageSelectionService: DirectMessageSelectionService
  ) {}
  ngOnInit(): void {
    this.setUser();
  }

  setUser() {
    this.directMessageSelectionService
      .getSelectedChannel()
      .subscribe((value) => {
        this.user = value;
      });
  }
}

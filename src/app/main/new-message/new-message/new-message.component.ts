import { Component } from '@angular/core';
import { NewMessageInputComponent } from '../new-message-input/new-message-input.component';
import { NewMessageSearchResultsComponent } from '../new-message-search-results/new-message-search-results.component';
import { NewMessageHeaderComponent } from '../new-message-header/new-message-header.component';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [
    NewMessageInputComponent,
    NewMessageSearchResultsComponent,
    NewMessageHeaderComponent,
  ],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent {}

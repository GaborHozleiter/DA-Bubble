import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewMessageSelectionService } from '../../../services/new-message-selection.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ChannelSelectionService } from '../../../services/channel-selection.service';

@Component({
  selector: 'app-new-message-search-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-message-search-results.component.html',
  styleUrls: ['./new-message-search-results.component.scss'],
})
export class NewMessageSearchResultsComponent implements OnInit {
  allUserSorted: any[] = [];
  allChannelSorted: any[] = [];
  selectedElement: any;
  currentUserId: any;
  selectedChannel: string | undefined;
  constructor(
    public newMessageSelectionService: NewMessageSelectionService,
    public authService: AuthService,
    public channelSelectionService: ChannelSelectionService
  ) { }

  ngOnInit(): void {
    (this.currentUserId = this.authService.currentUserSignal()?.uId),
      this.newMessageSelectionService.getAllUserSorted().subscribe((data) => {
        this.allUserSorted = data;
      });
    this.newMessageSelectionService.getAllChannelSorted().subscribe((data) => {
      this.allChannelSorted = data;
    });
  }

  setChannel(uid: any, channel: any, index: number | null, event: any) {
    this.newMessageSelectionService.setselecteduid(uid);
    this.newMessageSelectionService.setselectedChannel(channel);
    this.selectedChannel = channel;
    if (index !== null) {
      this.channelSelectionService.selectedChannelIndex = index;
    } if (this.selectedElement) {
      this.selectedElement.classList.remove('selectedContent');
    }
    event.currentTarget.classList.add('selectedContent');
    this.selectedElement = event.currentTarget;
  }


}

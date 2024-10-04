import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NewMessageSelectionService } from '../../../services/new-message-selection.service';
import { Subscription } from 'rxjs';

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
  constructor(public newMessageSelectionService: NewMessageSelectionService) {}

  ngOnInit(): void {
    this.newMessageSelectionService.getAllUserSorted().subscribe((data) => {
      this.allUserSorted = data;
    });
    this.newMessageSelectionService.getAllChannelSorted().subscribe((data) => {
      this.allChannelSorted = data;
    });
  }

  setChannel(uid: any, channel: any, event: any) {
    this.newMessageSelectionService.setselecteduid(uid);
    this.newMessageSelectionService.setselectedChannel(channel);

    // Entferne die Klasse 'selectedContent' vom zuvor ausgewählten Element
    if (this.selectedElement) {
      this.selectedElement.classList.remove('selectedContent');
    }

    // Füge die Klasse 'selectedContent' dem aktuell ausgewählten Element hinzu
    event.currentTarget.classList.add('selectedContent');
    this.selectedElement = event.currentTarget;
  }
}

import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChannelComponent } from '../channel/channel/channel.component';
import { CreateChannelComponent } from '../create-channel/create-channel.component';
import { OpenSidebarComponent } from '../open-sidebar/open-sidebar.component';
import { EditProfilComponent } from '../edit-profil/edit-profil.component';
import { EditProfilContactformComponent } from '../edit-profil-contactform/edit-profil-contactform.component';
import { UserProfilComponent } from '../user-profil/user-profil.component';
import { AddUserToChannelComponent } from '../add-user-to-channel/add-user-to-channel.component';
import { DirectMessagesComponent } from '../direct-messages/direct-messages/direct-messages.component';
import { CommonModule } from '@angular/common';
import { EditChannelComponent } from '../edit-channel/edit-channel.component';
import { OnInit } from '@angular/core';
import { ChannelSelectionService } from '../../services/channel-selection.service';
import { EditChannelService } from '../../services/edit-channel.service';
import { NewMessageComponent } from '../new-message/new-message/new-message.component'; // Importiere den EditChannelService
import { ChannelUserlistComponent } from '../channel-userlist/channel-userlist.component';
import { ReactionListComponent } from '../reaction-list/reaction-list.component';
import { SearchService } from '../../services/search.service';
import { OpenImgComponent } from '../open-img/open-img.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    ChannelComponent,
    CreateChannelComponent,
    OpenSidebarComponent,
    EditProfilComponent,
    EditProfilContactformComponent,
    UserProfilComponent,
    AddUserToChannelComponent,
    DirectMessagesComponent,
    CommonModule,
    EditChannelComponent,
    NewMessageComponent,
    ChannelUserlistComponent,
    ReactionListComponent,
    OpenImgComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', './home-responsive.component.scss'],
})
export class HomeComponent implements OnInit {
  selectedReaction: string = ''; // Variable zum Speichern der Reaktion
  searchService = inject(SearchService);
  constructor(
    public channelSelectionService: ChannelSelectionService,
    public editChannelService: EditChannelService // Füge den Service hier hinzu
  ) {}

  ngOnInit() {
    this.channelSelectionService.getselectedReaction().subscribe((reaction) => {
      this.selectedReaction = reaction;
    });
  }
}

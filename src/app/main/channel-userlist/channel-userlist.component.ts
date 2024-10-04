import { Component, inject } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-channel-userlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel-userlist.component.html',
  styleUrls: ['./channel-userlist.component.scss', './channel-userlist-responsive.component.scss']
})

export class ChannelUserlistComponent {
  channelInfo = inject(SidebarService);
  authService = inject(AuthService);

  closeDialog() {
    this.channelInfo.openUserList = false;
  }

  notCloseDialog(e: any) {
    e.stopPropagation(e);
  }

  addUserToChannel(){
    this.channelInfo.addUserFromHeaderToChannelOpen = true;
    this.closeDialog();
  }

  openUserProfil(i: number){
    this.channelInfo.userProfilOpen = true;
    this.channelInfo.activeUserProfil = i;
    this.channelInfo.activeUser = this.channelInfo.AllChannelsUsers[this.channelInfo.currentChannelNumber][i];
    this.channelInfo.activeEmail = this.channelInfo.AllChannelsEmails[this.channelInfo.currentChannelNumber][i];;
    this.channelInfo.activeImage = this.channelInfo.AllChannelsImages[this.channelInfo.currentChannelNumber][i];
    this.channelInfo.activeUid = this.channelInfo.GlobalChannelUids[this.channelInfo.currentChannelNumber][i];
    this.closeDialog();
  }

}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-edit-profil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-profil.component.html',
  styleUrls: ['./edit-profil.component.scss', './edit-profil-responsive.component.scss']
})
export class EditProfilComponent {
  hideOrShowPopUp = inject(SidebarService);
  authService = inject(AuthService);
  userOnline = false;

  closeDialog(){
    this.hideOrShowPopUp.editProfilOpen = false;
  }

  notCloseDialog(e : any){
    e.stopPropagation(e);
  }

  editUser(){
    this.hideOrShowPopUp.editProfilContactformOpen = true;
  }

  sendMessage(){
    alert('Message send');
  }

}

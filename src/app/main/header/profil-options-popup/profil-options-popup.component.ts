import { Component, inject } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { ResponsiveService } from '../../../services/responsive.service';


@Component({
  selector: 'app-profil-options-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profil-options-popup.component.html',
  styleUrls: ['./profil-options-popup.component.scss', './profil-options-popup-responsive.component.scss']
})
export class ProfilOptionsPopupComponent {
  authService = inject(AuthService)
  hideOrShowPopUp = inject(SidebarService);
  router = inject(Router);
  responsiveService = inject(ResponsiveService);

  constructor(private firestore : Firestore) {}

  closeDialog(){
    this.hideOrShowPopUp.popUpOpen = false;
  }

  notCloseDialog(e : any){
    e.stopPropagation(e);
  }

  openProfil(){
    this.hideOrShowPopUp.editProfilOpen = true;
  }

  resetViewState(){
    this.hideOrShowPopUp.popUpOpen = false;
    this.hideOrShowPopUp.currentChannelNumber = 0;
    this.hideOrShowPopUp.online = false;
    this.responsiveService.isChannelOpen = false;
    this.responsiveService.isDirectMessageOpen = false;
    this.responsiveService.isThreadOpen = false;
    this.responsiveService.isSidebarOpen = true;
  }

  logOut() {
    this.authService.logOut().subscribe(() => {
      this.router.navigate(['/']);
    });
    this.resetViewState();
    this.userOffline();
  }

  async userOffline(){
    const userRef = doc(
      collection(this.firestore, 'online'),
      this.authService.currentUserSignal()?.uId
    );
    await setDoc(userRef, this.toJSON())
  }

  toJSON(){
    return {
      online : "no" ,
      onlineSince : new Date().getTime() ,
      uId : this.authService.currentUserSignal()?.uId
    }
  }

}

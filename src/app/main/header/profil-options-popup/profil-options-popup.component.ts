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

  /**
 * Closes the pop-up dialog.
 * 
 * This method sets the `popUpOpen` property to false, 
 * effectively closing any currently open pop-up dialog.
 */
  closeDialog(){
    this.hideOrShowPopUp.popUpOpen = false;
  }

  /**
 * Prevents the pop-up dialog from closing when an event occurs.
 * 
 * This method stops the propagation of the event `e`, which 
 * prevents the dialog from being closed unintentionally 
 * during specific user interactions.
 * 
 * @param {any} e - The event object from the user interaction.
 */
  notCloseDialog(e : any){
    e.stopPropagation(e);
  }

  /**
 * Opens the user profile editing dialog.
 * 
 * This method sets the `editProfilOpen` property to true, 
 * allowing the user to edit their profile information.
 */
  openProfil(){
    this.hideOrShowPopUp.editProfilOpen = true;
  }

  /**
 * Resets the view state of the application.
 * 
 * This method closes the pop-up, resets the current channel 
 * number to 0, sets the online status to false, and updates 
 * the state of the responsive service to ensure that all 
 * channels and sidebar views are closed or reset as necessary.
 */
  resetViewState(){
    this.hideOrShowPopUp.popUpOpen = false;
    this.hideOrShowPopUp.currentChannelNumber = 0;
    this.hideOrShowPopUp.online = false;
    this.responsiveService.isChannelOpen = false;
    this.responsiveService.isDirectMessageOpen = false;
    this.responsiveService.isThreadOpen = false;
    this.responsiveService.isSidebarOpen = true;
  }

  /**
 * Logs the user out of the application.
 * 
 * This method calls the logout service and navigates the user 
 * back to the home page upon successful logout. It also resets 
 * the view state and updates the user's offline status.
 */
  logOut() {
    this.authService.logOut().subscribe(() => {
      this.router.navigate(['/']);
    });
    this.resetViewState();
    this.userOffline();
  }

  /**
 * Updates the user's online status to offline in the Firestore database.
 * 
 * This method creates a document reference for the current user 
 * in the 'online' collection and sets the user's online status 
 * to offline.
 */
  async userOffline(){
    const userRef = doc(
      collection(this.firestore, 'online'),
      this.authService.currentUserSignal()?.uId
    );
    await setDoc(userRef, this.toJSON())
  }

  /*
 * Converts the user's status to a JSON object.
 * 
 * This method returns an object containing the user's online status,
 * the time they went offline, and their user ID.
 * 
 * @returns {Object} - The user's online status data.
 */
  toJSON(){
    return {
      online : "no" ,
      onlineSince : new Date().getTime() ,
      uId : this.authService.currentUserSignal()?.uId
    }
  }

}

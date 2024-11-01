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

  /**
 * Closes the profile edit dialog.
 * 
 * This method sets the `editProfilOpen` property to false, 
 * effectively closing the profile editing pop-up dialog.
 */
  closeDialog() {
    this.hideOrShowPopUp.editProfilOpen = false;
  }

  /**
  * Prevents the dialog from closing when an event occurs.
  * 
  * This method stops the propagation of the event `e`, which 
  * prevents the dialog from being closed unintentionally 
  * during specific user interactions.
  * 
  * @param {any} e - The event object from the user interaction.
  */
  notCloseDialog(e: any) {
    e.stopPropagation();
  }

  /**
  * Opens the user contact form for editing.
  * 
  * This method sets the `editProfilContactformOpen` property 
  * to true, allowing the user to edit their contact information 
  * in the profile.
  */
  editUser() {
    this.hideOrShowPopUp.editProfilContactformOpen = true;
  }

  /**
  * Sends a message to the user.
  * 
  * This method triggers an alert to inform the user that the 
  * message has been sent successfully.
  */
  sendMessage() {
    alert('Message sent');
  }

}

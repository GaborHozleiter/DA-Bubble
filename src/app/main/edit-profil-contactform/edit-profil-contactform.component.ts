import { Component, inject } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-profil-contactform',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profil-contactform.component.html',
  styleUrls: ['./edit-profil-contactform.component.scss', './edit-profil-contactform-responsive.component.scss']
})
export class EditProfilContactformComponent {
  authService = inject(AuthService);
  hideOrShowPopUp = inject(SidebarService);
  fb = inject(FormBuilder);
  errorMessage: string | null = null;
  successMessage: string | null = null;

  form = this.fb.nonNullable.group({
    name: [this.authService.currentUserSignal()?.name ?? '', [
      Validators.minLength(6),
      Validators.maxLength(20),
    ]],
    email: [this.authService.currentUserSignal()?.email ?? '', [
      Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'),
    ]],
  });

  /**
   * Closes the profile editing form.
   */
  closeDialog() {
    this.hideOrShowPopUp.editProfilContactformOpen = false;
  }

  /**
   * Prevents the dialog from closing when clicking inside the form.
   * @param {Event} e - The event object.
   */
  notCloseDialog(e: any) {
    e.stopPropagation(e);
  }

  /**
   * Cancels the profile editing process and closes the dialog.
   */
  cancel() {
    this.closeDialog();
  }

  /**
   * Handles the form submission to update the user profile.
   * Validates the form and calls `updateUserData` from `AuthService` to update the user's name and email.
   * Displays success or error messages based on the result.
   */
  async onSubmit() {
    const { email, name } = this.form.getRawValue();
    if (!this.form.get('name')?.dirty && !this.form.get('email')?.dirty) {
      this.errorMessage = 'Bitte ändern Sie mindestens ein Feld.';
      this.resetErrorMessage();
      return;
    } if (this.form.invalid) {
      this.errorMessage = 'Bitte füllen Sie das Formular korrekt aus.';
      this.resetErrorMessage();
      return;
    } try {
      await this.authService.updateUserData(email, name);
      this.successMessage = 'Profil erfolgreich aktualisiert.';
      this.closePopup();
    } catch (error) {
    }
  }

  closePopup(){
    setTimeout(() => {
      this.closeDialog();
      this.errorMessage = '';
      this.successMessage = '';
    }, 1500);
  }

  resetErrorMessage() {
    setTimeout(() => {
      this.errorMessage = '';
    }, 1500);
  }
}





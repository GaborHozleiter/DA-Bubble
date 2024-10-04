import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  router = inject(Router);
  imgSrcArrow: string = '../../../assets/img/landing-page/arrow-back.png';
  emailSent: boolean = false;
  errorMessage: string = '';
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')]]
  });

  constructor(private _location: Location) {}

  /**
   * Handles the form submission to trigger a password reset email.
   * If the form is valid, it calls the `passwordReset` method from `AuthService`.
   * On success, sets `emailSent` to true and navigates to the homepage after a short delay.
   * On failure, logs the error to the console.
   */
  onSubmit() {
    if (this.form.valid) {
      const email = this.form.get('email')?.value;
      this.authService.passwordReset(email!)
        .then(() => {
          this.emailSent = true;
          setTimeout(() => {
            this.emailSent = false;
            this.router.navigateByUrl('/');
          }, 500);
        })
        .catch(error => {
          if (error.code === 'auth/user-not-found') {
            //console.error('Error sending password reset email:', error);
            this.errorMessage = 'Die eingegebene E-Mail-Adresse ist nicht registriert.'
            setInterval(() => {
              this.errorMessage = '';
            }, 3000);
          }
        });
    } else {
      console.log('Form is invalid');
    }
  }

  /**
   * Navigates the user back to the previous page.
   * Uses the `Location` service to handle browser history.
   */
  goBack() {
    this._location.back();
  }
}

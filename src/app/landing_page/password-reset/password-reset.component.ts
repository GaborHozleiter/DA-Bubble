import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RevealPasswordService } from '../../services/reveal-password.service';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  revealPasswordService = inject(RevealPasswordService);
  imgSrcArrow: string = '../../../assets/img/landing-page/arrow-back.png';
  succes: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  form: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  }, { validators: this.passwordsMatchValidator });
  
  constructor() {}

  /**
   * Handles the form submission for resetting the password.
   * Validates the form and calls the `changePassword` method from `AuthService`.
   * On success, sets `succes` to true and navigates to the homepage after a short delay.
   * On error, sets an error message to display to the user.
   */
  onSubmit(): void {
    const newPassword = this.form.get('newPassword')?.value;
    const actionCode = this.route.snapshot.queryParams['oobCode'];

    if (newPassword && this.form.valid) {
      this.authService.changePassword(actionCode, newPassword).then(() => {
        this.succes = true;
          setTimeout(() => {
            this.succes = false;
            this.router.navigateByUrl('/');
          }, 500);
      }).catch((err) => {
        this.errorMessage = 'Failed to reset password: ' + err.message;
      });
    }
  }

  /**
   * Custom validator to check if the `newPassword` and `confirmPassword` fields match.
   * @param {AbstractControl} control - The form control group containing the password fields.
   * @returns {object | null} Returns an object with an error key if the passwords don't match, otherwise null.
   */
  passwordsMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordsMismatch: true };
    }
    return null;
  }

}




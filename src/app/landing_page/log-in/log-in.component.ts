import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import { RevealPasswordService } from '../../services/reveal-password.service';
import {
  Firestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
  encapsulation: ViewEncapsulation.None 
})
export class LogInComponent implements OnInit{
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);
  errorMessage: string | null = null; 
  userInfo = inject(SidebarService);
  revealPasswordService = inject(RevealPasswordService);
  animationDone:boolean = false;
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')]],
    password: ['', [Validators.required]],
  });

  constructor(private firestore : Firestore) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.animationDone = true;
    }, 4000);
    
  }
  
  /**
   * Initiates Google Sign-In process.
   * On success, it navigates to the '/home' page and fetches the user data.
   * On failure, it sets the error message with the error received.
   */
  googleSignIn() {
    this.authService.signInWithGoogle().subscribe({
      next: () => {
        this.router.navigateByUrl('/home');
        this.userInfo.fetchUsers();
        this.userInfo.activeChannelIndex = 0;

        this.userOnline();
        this.fetchUsersOnline();

        this.userInfo.online = true;
        let time = new Date().getTime();
        if(this.userInfo.asd == 0){
          setInterval(() => {
            let newTime = new Date().getTime();
            if(this.userInfo.online){
              this.userInfo.asd = newTime - time;
              this.onlineSince();
            }
          }, 3000);
        }
        
      },
      error: (err) => {
        this.errorMessage = err.message;
      }
    });
  }

  async fetchUsersOnline(){
    const usersCollection = collection(this.firestore, 'online');
    onSnapshot(usersCollection, (querySnapshot) => {
      
      this.userInfo.onlineUserUidList = [];
      querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if(userData['online'] == 'yes' && userData['onlineSince'] > (new Date().getTime() - 4000)){    // 
            this.userInfo.onlineUserUidList.push(userData['uId']);
          };
          
      });
  }, (error) => {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
  });
  }

  async userOffline(){
    const userRef = doc(
      collection(this.firestore, 'online'),
      this.authService.currentUserSignal()?.uId
    );
    await setDoc(userRef, this.logOutToJSON())
  }

  logOutToJSON(){
    return {
      online : "no" ,
      onlineSince : new Date().getTime() ,
      uId : this.authService.currentUserSignal()?.uId
    }
  }

  async onlineSince(){
    const userRef = doc(
      collection(this.firestore, 'online'),
      this.authService.currentUserSignal()?.uId
    );
    await setDoc(userRef, this.sinceToJSON())
  }

  async userOnline(){
    const userRef = doc(
      collection(this.firestore, 'online'),
      this.authService.currentUserSignal()?.uId
    );
    await setDoc(userRef, this.toJSON())
  }

  sinceToJSON(){
    return {
      online : "yes" ,
      onlineSince : new Date().getTime() ,
      uId : this.authService.currentUserSignal()?.uId
    }
  }

  toJSON(){
    return {
      online : "yes" ,
      onlineSince : new Date().getTime() ,
      uId : this.authService.currentUserSignal()?.uId
    }
  }

  /**
   * Logs in as a guest user.
   * On success, it navigates to the '/home' page and fetches user data.
   * On failure, logs the error in the console.
   */
  guestLogin() {
    this.authService.guestLogin().subscribe({
      next: () => {
        this.router.navigateByUrl('/home');
        this.userInfo.fetchUsers();
        this.userInfo.activeChannelIndex = 0;

        this.userOnline();
        this.fetchUsersOnline();

        this.userInfo.online = true;
        let time = new Date().getTime();
        if(this.userInfo.asd == 0){
          setInterval(() => {
            let newTime = new Date().getTime();
            if(this.userInfo.online){
              this.userInfo.asd = newTime - time;
              this.onlineSince();
            }
          }, 3000);
        }
      },
      error: (err) => {
        console.error('Guest login failed:', err);
      }
    });
  }

  /**
   * Handles the form submission for logging in.
   * If the form is valid, it calls the `logIn` method from `AuthService` and navigates to '/home' on success.
   * On error, it calls `handleError` to display the appropriate error message.
   */
  onSubmit(): void {
    const rawForm = this.form.getRawValue();
    if (this.form.valid) {
      this.authService.logIn(rawForm.email, rawForm.password).subscribe({
        next: () => {
          this.router.navigateByUrl('/home');
          
          this.userOnline();
          this.fetchUsersOnline();

          this.userInfo.online = true;
          let time = new Date().getTime();
          if(this.userInfo.asd == 0){
            setInterval(() => {
              let newTime = new Date().getTime();
              if(this.userInfo.online){
                this.userInfo.asd = newTime - time;
                this.onlineSince();
              }
            }, 3000);
          }
        },
        error: (err) => {
          this.handleError(err.code);
        }
      });
    }
  }

  /**
   * Handles errors by mapping the error code to user-friendly messages.
   * @param {string} errorCode - The error code returned by the authentication process.
   */
  private handleError(errorCode: string): void {
    switch (errorCode) {
      case 'auth/user-not-found':
        this.errorMessage = 'Es existiert kein Benutzer mit dieser E-Mail-Adresse.';
        break;
      case 'auth/invalid-credential':
        this.errorMessage = 'Falsches E-Mail oder Passwort. Bitte überprüfen und erneut versuchen.';
        break;
      case 'auth/invalid-email':
        this.errorMessage = 'Diese E-Mail-Adresse ist ungültig.';
        break;
      case 'auth/too-many-requests':
        this.errorMessage = 'Zu viele fehlgeschlagene Anmeldeversuche. Bitte versuchen Sie es später erneut.';
        break;
      case 'auth/wrong-password':
        this.errorMessage = 'Das Passwort ist falsch. Bitte überprüfen Sie es und versuchen Sie es erneut.';
        break;
      default:
        this.errorMessage = 'Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
        break;
    }
  }
}

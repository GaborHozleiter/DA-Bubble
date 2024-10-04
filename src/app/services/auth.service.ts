import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  updateEmail
} from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { UserInterFace } from '../../models/user.interface';
import { SaveNewUserService } from './save-new-user.service';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSignal = signal<UserInterFace | null | undefined>(undefined);
  provider = new GoogleAuthProvider();
  saveUser = inject(SaveNewUserService);
  firestore = inject(Firestore)

  /**
   * Signs in a user with Google using a popup window.
   * Updates the current user signal and saves the user's information.
   * @returns {Observable<void>} An observable that resolves when the sign-in is complete.
   */
  signInWithGoogle(): Observable<void> {
    return from(
      signInWithPopup(this.firebaseAuth, this.provider)
        .then((result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential) {
            const token = credential.accessToken;
            // Google Access Token can be used here
          }
          const name = result.user.displayName ?? 'Unknown User';
          const email = result.user.email ?? 'unknown@example.com';
          const imgUrl = result.user.photoURL ?? '';
          const uId = result.user.uid;
          this.currentUserSignal.set({name,email,imgUrl,uId,});
          console.log("User signed in with Google:", name, email);
          this.saveUser.saveUser(uId, email, name, imgUrl);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error("Error during Google Sign-In:", errorCode, errorMessage);
          throw error;
        })
    );
  }

  /**
   * Registers a new user with email, name, and password.
   * Updates the user's profile and saves the information.
   * @param {string} email - The user's email.
   * @param {string} name - The user's display name.
   * @param {string} password - The user's password.
   * @param {string} imgUrl - The user's profile image URL.
   * @returns {Observable<string>} An observable that returns the user's ID on successful registration.
   */
  register(email: string, name: string, password: string, imgUrl: string): Observable<string> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(response => {
        const uId = response.user.uid;
        return updateProfile(response.user, { displayName: name, photoURL: imgUrl })
          .then(() => {
            this.currentUserSignal.set({ name, email, imgUrl, uId, });
            return uId;
          });
      }).catch(error => {
        console.error('Error updating profile:', error);
        throw error;
      });
    return from(promise);
  }

  /**
   * Logs in a user using email and password.
   * Updates the current user signal on success.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Observable<void>} An observable that resolves when the login is successful.
   */
  logIn(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password).then((result) => {
      const uId = result.user.uid;
      const name = result.user.displayName ?? 'Unknown User';
      const imgUrl = result.user.photoURL ?? '';
      this.currentUserSignal.set({ name, email, imgUrl, uId, });
    });
    return from(promise);
  }

  /**
   * Logs in as a guest user using predefined credentials.
   * @returns {Observable<void>} An observable that resolves when the guest login is successful.
   */
  guestLogin(): Observable<void> {
    const predefinedEmail = 'gast@gastmail.com';
    const predefinedPassword = 'asdasd';
    const promise = signInWithEmailAndPassword(this.firebaseAuth, predefinedEmail, predefinedPassword)
      .then((result) => {
        const uId = result.user.uid;
        const name = result.user.displayName ?? 'Gast';
        const imgUrl = result.user.photoURL ?? '../../../assets/img/landing-page/profile.png';
        this.currentUserSignal.set({ name, email: predefinedEmail, imgUrl, uId });
      });

    return from(promise);
  }

  /**
   * Logs out the currently signed-in user.
   * @returns {Observable<void>} An observable that resolves when the logout is complete.
   */
  logOut(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }

  /**
   * Sends a password reset email to the specified email address.
   * @param {string} email - The user's email address.
   * @returns {Promise<void>} A promise that resolves when the email is sent.
   */
  passwordReset(email: string): Promise<void> {
    return sendPasswordResetEmail(this.firebaseAuth, email);
  }

  /**
   * Changes the user's password using an action code and new password.
   * Verifies the action code and updates the password.
   * @param {string} actionCode - The password reset action code.
   * @param {string} newPassword - The new password to be set.
   * @returns {Promise<void>} A promise that resolves when the password is successfully changed.
   */
  changePassword(actionCode: string, newPassword: string): Promise<void> {
    return verifyPasswordResetCode(this.firebaseAuth, actionCode).then((email) => {
      return confirmPasswordReset(this.firebaseAuth, actionCode, newPassword).then(() => {
        console.log('Password reset has been confirmed and updated for email:', email);
      }).catch((error) => {
        console.error('Error during password confirmation:', error);
        throw new Error('Failed to reset password. The code might have expired or the password is too weak.');
      });
    }).catch((error) => {
      console.error('Invalid or expired action code:', error);
      throw new Error('Invalid or expired password reset code.');
    });
  }

  /**
   * Updates the user's email and display name.
   * @param {string} email - The new email address.
   * @param {string} name - The new display name.
   * @returns {Promise<void>} A promise that resolves when the user's data is successfully updated.
   */
  async updateUserData(email: string, name: string): Promise<void> {
    const currentUser = this.firebaseAuth.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently signed in.');
    }
    try {
      if (currentUser.email !== email) {
        await updateEmail(currentUser, email);
      }
      if (currentUser.displayName !== name) {
        await updateProfile(currentUser, { displayName: name });
      }
      await this.updateUserInDatabase(currentUser.uid, name);
      this.currentUserSignal.set({
        email, name, imgUrl: currentUser.photoURL ?? '', uId: currentUser.uid
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Updates the user's name in the Firestore database.
   * @param {string} userId - The user's ID.
   * @param {string} name - The new name to be updated in the database.
   * @returns {Promise<void>} A promise that resolves when the user's name is successfully updated in Firestore.
   */
  async updateUserInDatabase(userId: string, name: string): Promise<void> {
    const userDocRef = doc(this.firestore, `Users/${userId}`);
    await updateDoc(userDocRef, { name: name });
  }
}

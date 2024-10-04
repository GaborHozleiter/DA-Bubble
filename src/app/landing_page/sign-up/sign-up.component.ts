import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { getStorage, ref } from "firebase/storage";
import { deleteObject, getDownloadURL, uploadBytesResumable } from '@angular/fire/storage';
import { SaveNewUserService } from '../../services/save-new-user.service';
import { RevealPasswordService } from '../../services/reveal-password.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss', 'sign-up.component-2.scss']
})
export class SignUpComponent {
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);
  saveUser = inject(SaveNewUserService);
  revealPasswordService = inject(RevealPasswordService)

  imgSrcArrow: string = '../../../assets/img/landing-page/arrow-back.png';
  imgSrcCheck: string = '../../../assets/img/landing-page/checkbox-unchecked.png';
  imgSrcUnchecked: string = '../../../assets/img/landing-page/checkbox-unchecked.png';
  imgSrcChecked: string = '../../../assets/img/landing-page/checkbox-checked.png';
  imgSrcUncheckedHover: string = '../../../assets/img/landing-page/checkbox-unchecked-hover.png';
  imgSrcCheckedHover: string = '../../../assets/img/landing-page/checkbox-checked-hover.png';

  profileImgsSrc: string[] = [
    '../../../assets/img/profile-imgs/female1.png',
    '../../../assets/img/profile-imgs/female2.png',
    '../../../assets/img/profile-imgs/male1.png',
    '../../../assets/img/profile-imgs/male2.png',
    '../../../assets/img/profile-imgs/male3.png',
    '../../../assets/img/profile-imgs/male4.png',
  ]
  stepTwo: boolean = false;
  isClicked: boolean = false;
  isHoveringOver: boolean = false;
  public submitted: boolean = false;
  imgUrl: string = '';
  errorMessage: string | null = null;
  selectedFileCache: File | null = null;
  selectectUrlCache: any;
  selectetFileNameCache: any;
  selectedFile: File | null = null;
  selectectUrl: any;
  selectetFileName: any;
  registerSuccesful: boolean = false;
  imgChosen: boolean = false;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')]],
    password: ['', Validators.required],
  })

  constructor(private _location: Location) {
    this.updateImageSrc();
  }

  /**
   * Observes if an image has been chosen by the user.
   * Sets `imgChosen` to true if an image URL is present, otherwise false.
   */
  observeImgChosen() {
    if (this.imgUrl == '') {
      this.imgChosen = false;
    } else {
      this.imgChosen = true;
    }
  }

  /**
   * Navigates the user back to the previous page.
   * Uses the `Location` service to handle browser history.
   */
  goBack() {
    this._location.back();
  }

  /**
   * Toggles the view between step one and step two of the registration process.
   */
  toggleStep() {
    this.stepTwo = !this.stepTwo;
  }

  /**
   * Submits the registration form.
   * Saves the user's profile image if selected, and registers the user with the provided email, name, and password.
   * On success, saves the new user and navigates to the homepage.
   */
  async onSubmit(): Promise<void> {
    const rawForm = this.form.getRawValue();
    if (this.selectedFile) {
      await this.saveFile();
    } if (this.isClicked) {
      this.authService.register(rawForm.email, rawForm.name, rawForm.password, this.imgUrl).subscribe({
        next: (userId) => {
          this.registerSuccesful = true;
          this.saveUser.saveUser(userId, rawForm.email, rawForm.name, this.imgUrl);
          setTimeout(() => {
            this.registerSuccesful = false;
            this.router.navigateByUrl('/');
          }, 500);
        }, 
        error: (err) => {
          if (err.code === 'auth/email-already-in-use') {
            this.stepTwo = false;
            this.errorMessage = 'Diese E-Mail-Adresse ist bereits registriert. Bitte verwenden Sie eine andere E-Mail.';
          } else {
            this.errorMessage = err.code;
          }
        }
      });
    }
  }

  /**
   * Chooses a profile avatar from the predefined list.
   * Updates the image URL and checks if an image is selected.
   * @param {string} profileImg - The URL of the selected profile image.
   */
  chooseAvatar(profileImg: string) {
    this.imgUrl = profileImg;
    this.observeImgChosen();
  }

  /**
   * Handles the event when a file is selected by the user for upload.
   * Deletes any cached file and saves the newly selected file to cache.
   * @param {any} event - The file selection event.
   */
  onFileSelected(event: any) {
    if (this.selectectUrlCache) {
      this.deleteCachedFile(this.selectetFileNameCache.name);
    }
    this.selectedFileCache = event.target.files[0];
    this.saveFileToCache();
  }

  /**
   * Saves the selected file to the user's profile.
   * Uploads the file to Firebase Storage and updates the image URL.
   */
  async saveFile() {
    this.selectedFile = this.selectedFileCache;
    if (this.selectedFile) {
      const imageUrl = await this.uploadFile(this.selectedFile);
      this.selectetFileName = this.selectedFile;
      this.selectectUrl = imageUrl;
    } else {
      console.error('No file selected');
    }
    this.deleteCachedFile(this.selectedFileCache!.name);
  }

  /**
   * Saves the selected file to the cache.
   * Uploads the file to Firebase Storage cache and updates the image URL.
   */
  async saveFileToCache() {
    if (this.selectedFileCache) {
      const imageUrl = await this.uploadFileToCache(this.selectedFileCache);
      this.selectetFileNameCache = this.selectedFileCache;
      this.selectectUrlCache = imageUrl;
      this.observeImgChosen();
    } else {
      console.error('No file selected');
    }
  }

  /**
   * Uploads a file to Firebase Storage.
   * @param {File} file - The file to be uploaded.
   * @returns {Promise<string>} - A promise that resolves to the download URL of the uploaded file.
   */
  uploadFile(file: File): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, `profileImages/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => { },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: any) => {
            resolve(downloadURL);
            this.imgUrl = downloadURL;
          });
        }
      );
    });
  }

  /**
   * Uploads a file to the cache in Firebase Storage.
   * @param {File} file - The file to be uploaded to the cache.
   * @returns {Promise<string>} - A promise that resolves to the download URL of the uploaded file.
   */
  uploadFileToCache(file: File): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, `profileCache/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => { },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: any) => {
            resolve(downloadURL);
            this.imgUrl = downloadURL;
          });
        }
      );
    });
  }

  /**
   * Deletes a cached file from Firebase Storage.
   * @param {string} fileUrl - The URL of the file to be deleted.
   * @returns {Promise<void>} - A promise that resolves when the file is deleted.
   */
  async deleteCachedFile(fileUrl: string): Promise<void> {
    const storage = getStorage();
    const fileRef = ref(storage, `profileCache/${fileUrl}`);
    return deleteObject(fileRef)
      .then(() => {
        console.log('File deleted successfully');
        this.selectectUrlCache = null;
      })
      .catch((error) => {
        console.error('Error deleting file:', error);
      });
  }

  /**
   * Handles mouse hover over the checkbox, changing its appearance.
   */
  mouseOver() {
    if (this.imgSrcCheck == "../../../assets/img/landing-page/checkbox-unchecked.png") {
      this.imgSrcCheck = "../../../assets/img/landing-page/checkbox-unchecked-hover.png";
    } else {
      this.imgSrcCheck = "../../../assets/img/landing-page/checkbox-checked-hover.png";
    }
  }

  /**
   * Handles mouse out from the checkbox, changing its appearance back to default.
   */
  mouseOut() {
    if (this.imgSrcCheck == "../../../assets/img/landing-page/checkbox-unchecked-hover.png") {
      this.imgSrcCheck = "../../../assets/img/landing-page/checkbox-unchecked.png";
    } else if (this.imgSrcCheck == "../../../assets/img/landing-page/checkbox-checked-hover.png" || this.isClicked) {
      this.imgSrcCheck = "../../../assets/img/landing-page/checkbox-checked.png";
    }
  }

  /**
   * Toggles the checkbox state between checked and unchecked.
   * Updates the image source accordingly.
   */
  toggleCheck() {
    this.isClicked = !this.isClicked;
    this.updateImageSrc();
  }

  /**
   * Updates the checkbox image source based on whether it is clicked or not.
   */
  updateImageSrc() {
    if (this.isClicked) {
      this.imgSrcCheck = this.imgSrcChecked;
    } else {
      this.imgSrcCheck = this.imgSrcUnchecked;
    }
  }
}

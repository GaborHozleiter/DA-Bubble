import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RevealPasswordService {
  imgUrl: string = "../../../assets/img/landing-page/hide.png"
  imgUrlHide: string = "../../../assets/img/landing-page/hide.png"
  imgUrlWiew: string = "../../../assets/img/landing-page/view.png"
  type: string = "password"
  password: string = "password"
  text: string = "text"
  reveal: boolean = false
  constructor() {

  }

  togglePassword() {
    this.reveal = !this.reveal
    this.changeImg();
    this.changeType();
  }

  changeImg() {
    if (this.reveal) {
      this.imgUrl = this.imgUrlWiew
    } else {
      this.imgUrl = this.imgUrlHide
    }
  }

  changeType() {
    if (this.reveal) {
      this.type = this.text
    } else {
      this.type = this.password
    }
  }
}

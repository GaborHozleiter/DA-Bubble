import { Component } from '@angular/core';
import {Location} from '@angular/common';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [],
  templateUrl: './impressum.component.html',
  styleUrl: './impressum.component.scss'
})
export class ImpressumComponent {
  imgSrcArrow: string = '../../../assets/img/landing-page/arrow-back.png';

  constructor(private _location: Location){
  }

  /**
   * Redirects to the last visited page.
   */
  goBack() {
    this._location.back();
  }
}

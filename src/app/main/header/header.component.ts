import { Component, inject } from '@angular/core';
import { SearchFieldComponent } from './search-field/search-field.component';
import { SidebarService } from '../../services/sidebar.service';
import { ProfilOptionsPopupComponent } from './profil-options-popup/profil-options-popup.component';
import { AuthService } from '../../services/auth.service';
import { ResponsiveService } from '../../services/responsive.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SearchFieldComponent, ProfilOptionsPopupComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss', './header-responsiv.component.scss']
})
export class HeaderComponent {
  authService = inject(AuthService);
  hideOrShowPopUp = inject(SidebarService);
  responsiveService = inject(ResponsiveService);

  openDialog(){
   this.hideOrShowPopUp.popUpOpen = true;
  }

  backToSidebar() {
    this.responsiveService.isChannelOpen = false;
    this.responsiveService.isDirectMessageOpen = false;
    this.responsiveService.isThreadOpen = false;
      if(window.innerWidth < 1000) {
        this.responsiveService.isSidebarOpen = true;
      }
  }

}

import { Component, inject } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-open-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './open-sidebar.component.html',
  styleUrls: ['./open-sidebar.component.scss', './open-sidebar-responsiv.component.scss']
})
export class OpenSidebarComponent {

  hideOrShowSidebar = inject(SidebarService);

  openSidebarMenu(){
    this.hideOrShowSidebar.sidebarOpen = !this.hideOrShowSidebar.sidebarOpen;
  }

}

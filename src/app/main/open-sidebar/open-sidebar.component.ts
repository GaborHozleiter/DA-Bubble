import { Component, inject } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { ThreadService } from '../../services/thread.service';
import { ResponsiveService } from '../../services/responsive.service';

@Component({
  selector: 'app-open-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './open-sidebar.component.html',
  styleUrls: [
    './open-sidebar.component.scss',
    './open-sidebar-responsiv.component.scss',
  ],
})
export class OpenSidebarComponent {
  hideOrShowSidebar = inject(SidebarService);
  threadService = inject(ThreadService);
  responsiveService = inject(ResponsiveService);

  /**
   * Toggles the visibility of the sidebar menu.
   *
   * This method updates the `sidebarOpen` property in the `hideOrShowSidebar`
   * object, switching its value between true and false.
   * If the sidebar is currently open, it will close it,
   * and if it is closed, it will open it.
   */
  openSidebarMenu() {
    this.hideOrShowSidebar.sidebarOpen = !this.hideOrShowSidebar.sidebarOpen;
    this.threadService.closeThread();
    this.responsiveService.isThreadOpen = false;
  }
}

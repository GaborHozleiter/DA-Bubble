import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ResponsiveService {
  isSidebarOpen = true;
  isHeaderOpen = false;
  isChannelOpen = false;
  isDirectMessageOpen = false;
  responsive = false;
  isThreadOpen = false;

  width: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkWidth();
      window.addEventListener('resize', this.checkWidth.bind(this));
    }
  }

  checkWidth() {
    if (isPlatformBrowser(this.platformId)) {
      this.width = window.innerWidth;
    }
  }
}

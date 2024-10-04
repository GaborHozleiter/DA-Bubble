import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {

  isSidebarOpen = true;
  isHeaderOpen = false;
  isChannelOpen = false;
  isDirectMessageOpen = false;
  responsive = false;
  isThreadOpen = false;

  constructor() { }
}

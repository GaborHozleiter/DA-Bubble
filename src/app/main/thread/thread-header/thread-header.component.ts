import { Component, inject } from '@angular/core';
import { ThreadService } from '../../../services/thread.service';
import { ResponsiveService } from '../../../services/responsive.service';

@Component({
  selector: 'app-thread-header',
  standalone: true,
  imports: [],
  templateUrl: './thread-header.component.html',
  styleUrl: './thread-header.component.scss',
})
export class ThreadHeaderComponent {
  constructor(private threadService: ThreadService) {}
  responsiveService = inject(ResponsiveService);

  closeThread() {
    this.threadService.closeThread();
    this.responsiveService.isThreadOpen = false;
  }
}

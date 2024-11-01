import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ChannelSelectionService } from '../../services/channel-selection.service';

@Component({
  selector: 'app-open-img',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './open-img.component.html',
  styleUrl: './open-img.component.scss',
})
export class OpenImgComponent implements OnInit {
  src = '';
  constructor(public channelSelectionService: ChannelSelectionService) {}

  ngOnInit(): void {
    this.channelSelectionService.getselectedIMG().subscribe((src) => {
      this.src = src;
    });
  }

  /**
   * Stops the propagation of the specified event, preventing it from bubbling up to parent elements.
   *
   * @param {any} event - The event object to stop propagation for.
   * @returns {void}
   */
  stopEvent(event: any): void {
    event.stopPropagation();
  }

  /**
   * Determines whether the provided image source has a greater width or height based on its aspect ratio.
   *
   * @param {string} src - The source URL of the image.
   * @returns {'width' | 'height'} - Returns 'width' if the image is wider than it is tall, otherwise returns 'height'.
   */
  getImageDimensionBasedOnAspect(src: string): 'width' | 'height' {
    const img = new Image();
    img.src = src;

    if (img.width > img.height) {
      return 'width';
    } else {
      return 'height';
    }
  }
}

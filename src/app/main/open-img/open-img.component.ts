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

  stopEvent(event: any) {
    event.stopPropagation();
  }

  getImageDimensionBasedOnAspect(src: string) {
    const img = new Image();
    img.src = src;

    if (img.width > img.height) {
      return 'width';
    } else {
      return 'height';
    }
  }
}

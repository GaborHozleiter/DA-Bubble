import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ChannelSelectionService } from '../../services/channel-selection.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-open-img',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // Füge HttpClientModule hier hinzu
  templateUrl: './open-img.component.html',
  styleUrls: ['./open-img.component.scss'],
})
export class OpenImgComponent implements OnInit {
  src = '';
  constructor(
    public channelSelectionService: ChannelSelectionService,
    private http: HttpClient
  ) {}

  imgWidth: any;
  imgHeight: any;

  ngOnInit(): void {
    this.channelSelectionService.getselectedIMG().subscribe((src) => {
      this.src = src;
      if (src) {
        this.getImageDimensionBasedOnAspect(src);
      }
    });
  }

  stopEvent(event: any): void {
    event.stopPropagation();
  }

  getImageDimensionBasedOnAspect(src: string) {
    const img = new Image();
    img.src = src;
    const width = img.width;
    const height = img.height;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const maxWidth = screenWidth * 0.8;
    const maxHeight = screenHeight * 0.8;

    let newWidth = width;
    let newHeight = height;

    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const scalingFactor = Math.min(widthRatio, heightRatio);

    newWidth = width * scalingFactor;
    newHeight = height * scalingFactor;

    this.imgHeight = newHeight;
    this.imgWidth = newWidth;
  }

  downloadImg(src: string) {
    this.http.get(src, { responseType: 'blob' }).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const fileName = src.split('?')[0].split('/').pop() || 'download.jpg';
      a.download = fileName;
      a.click();

      window.URL.revokeObjectURL(url);
    });
  }
}

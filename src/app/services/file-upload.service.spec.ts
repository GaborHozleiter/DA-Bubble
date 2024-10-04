import { TestBed } from '@angular/core/testing';

import { FileUploadeService } from './file-upload.service';

describe('FileUploadeService', () => {
  let service: FileUploadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileUploadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

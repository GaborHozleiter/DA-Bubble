import { TestBed } from '@angular/core/testing';

import { RevealPasswordService } from './reveal-password.service';

describe('RevealPasswordService', () => {
  let service: RevealPasswordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RevealPasswordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

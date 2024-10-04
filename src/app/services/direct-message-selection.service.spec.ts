import { TestBed } from '@angular/core/testing';

import { DirectMessageSelectionService } from './direct-message-selection.service';

describe('DirectMessageSelectionService', () => {
  let service: DirectMessageSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectMessageSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

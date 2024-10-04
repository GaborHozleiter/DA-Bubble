import { TestBed } from '@angular/core/testing';

import { NewMessageSelectionService } from './new-message-selection.service';

describe('NewMessageSelectionService', () => {
  let service: NewMessageSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewMessageSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

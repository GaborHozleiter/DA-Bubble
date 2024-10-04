import { TestBed } from '@angular/core/testing';

import { ChatAreaService } from './chat-area.service';

describe('ChatAreaService', () => {
  let service: ChatAreaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatAreaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

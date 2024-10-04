import { TestBed } from '@angular/core/testing';
import { SaveNewUserService } from './save-new-user.service';



describe('SaveNewUserService', () => {
  let service: SaveNewUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaveNewUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

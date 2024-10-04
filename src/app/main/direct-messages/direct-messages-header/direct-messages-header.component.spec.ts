import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMessagesHeaderComponent } from './direct-messages-header.component';

describe('DirectMessagesHeaderComponent', () => {
  let component: DirectMessagesHeaderComponent;
  let fixture: ComponentFixture<DirectMessagesHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectMessagesHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DirectMessagesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

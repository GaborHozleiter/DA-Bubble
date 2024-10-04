import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMessagesMessageInputComponent } from './direct-messages-message-input.component';

describe('DirectMessagesMessageInputComponent', () => {
  let component: DirectMessagesMessageInputComponent;
  let fixture: ComponentFixture<DirectMessagesMessageInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectMessagesMessageInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DirectMessagesMessageInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

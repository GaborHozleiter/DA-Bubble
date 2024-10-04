import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadMessageInputComponent } from './thread-message-input.component';

describe('ThreadMessageInputComponent', () => {
  let component: ThreadMessageInputComponent;
  let fixture: ComponentFixture<ThreadMessageInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadMessageInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadMessageInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

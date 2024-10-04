import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadChatAreaComponent } from './thread-chat-area.component';

describe('ThreadChatAreaComponent', () => {
  let component: ThreadChatAreaComponent;
  let fixture: ComponentFixture<ThreadChatAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadChatAreaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadChatAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

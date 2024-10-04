import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMessagesChatAreaComponent } from './direct-messages-chat-area.component';

describe('DirectMessagesChatAreaComponent', () => {
  let component: DirectMessagesChatAreaComponent;
  let fixture: ComponentFixture<DirectMessagesChatAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectMessagesChatAreaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DirectMessagesChatAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

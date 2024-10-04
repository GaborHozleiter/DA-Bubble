import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelChatAreaComponent } from './channel-chat-area.component';

describe('ChannelChatAreaComponent', () => {
  let component: ChannelChatAreaComponent;
  let fixture: ComponentFixture<ChannelChatAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelChatAreaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelChatAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

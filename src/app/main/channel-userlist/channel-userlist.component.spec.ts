import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelUserlistComponent } from './channel-userlist.component';

describe('ChannelUserlistComponent', () => {
  let component: ChannelUserlistComponent;
  let fixture: ComponentFixture<ChannelUserlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelUserlistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelUserlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

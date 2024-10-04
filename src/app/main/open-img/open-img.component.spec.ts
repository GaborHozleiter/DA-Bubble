import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenImgComponent } from './open-img.component';

describe('OpenImgComponent', () => {
  let component: OpenImgComponent;
  let fixture: ComponentFixture<OpenImgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenImgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OpenImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

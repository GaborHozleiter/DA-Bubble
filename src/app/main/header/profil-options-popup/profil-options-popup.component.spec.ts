import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilOptionsPopupComponent } from './profil-options-popup.component';

describe('ProfilOptionsPopupComponent', () => {
  let component: ProfilOptionsPopupComponent;
  let fixture: ComponentFixture<ProfilOptionsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilOptionsPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfilOptionsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

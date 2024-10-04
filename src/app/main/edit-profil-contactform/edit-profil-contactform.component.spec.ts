import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfilContactformComponent } from './edit-profil-contactform.component';

describe('EditProfilContactformComponent', () => {
  let component: EditProfilContactformComponent;
  let fixture: ComponentFixture<EditProfilContactformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfilContactformComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditProfilContactformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

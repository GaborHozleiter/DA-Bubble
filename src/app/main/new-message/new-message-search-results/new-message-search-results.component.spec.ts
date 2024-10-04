import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMessageSearchResultsComponent } from './new-message-search-results.component';

describe('NewMessageSearchResultsComponent', () => {
  let component: NewMessageSearchResultsComponent;
  let fixture: ComponentFixture<NewMessageSearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewMessageSearchResultsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewMessageSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

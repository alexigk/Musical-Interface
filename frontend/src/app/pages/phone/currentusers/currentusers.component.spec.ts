import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentusersComponent } from './currentusers.component';

describe('CurrentusersComponent', () => {
  let component: CurrentusersComponent;
  let fixture: ComponentFixture<CurrentusersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrentusersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentusersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongoptionsComponent } from './songoptions.component';

describe('SongoptionsComponent', () => {
  let component: SongoptionsComponent;
  let fixture: ComponentFixture<SongoptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SongoptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SongoptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

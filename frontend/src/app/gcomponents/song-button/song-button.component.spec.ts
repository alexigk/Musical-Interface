import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SongButtonComponent } from './song-button.component';

describe('SongButtonComponent', () => {
  let component: SongButtonComponent;
  let fixture: ComponentFixture<SongButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SongButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SongButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

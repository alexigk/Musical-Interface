import { TestBed } from '@angular/core/testing';

import { LeapService } from './leap.service';

describe('LeapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LeapService = TestBed.get(LeapService);
    expect(service).toBeTruthy();
  });
});

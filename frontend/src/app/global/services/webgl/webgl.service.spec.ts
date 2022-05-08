import { TestBed } from '@angular/core/testing';

import { WebglService } from './webgl.service';

describe('WebglService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebglService = TestBed.get(WebglService);
    expect(service).toBeTruthy();
  });
});

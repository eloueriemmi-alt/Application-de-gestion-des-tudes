import { TestBed } from '@angular/core/testing';

import { AlertChecker } from './alert-checker';

describe('AlertChecker', () => {
  let service: AlertChecker;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertChecker);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

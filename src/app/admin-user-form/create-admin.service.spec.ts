import { TestBed } from '@angular/core/testing';

import { CreateAdminService } from './create-admin.service';

describe('CreateAdminService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CreateAdminService = TestBed.get(CreateAdminService);
    expect(service).toBeTruthy();
  });
});

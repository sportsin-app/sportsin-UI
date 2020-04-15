import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceProviderFormComponent } from './service-provider-form.component';

describe('ServiceProviderFormComponent', () => {
  let component: ServiceProviderFormComponent;
  let fixture: ComponentFixture<ServiceProviderFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceProviderFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceProviderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

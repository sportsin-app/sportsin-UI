import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceNowComponent } from './service-now.component';

describe('ServiceNowComponent', () => {
  let component: ServiceNowComponent;
  let fixture: ComponentFixture<ServiceNowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceNowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceNowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceConsumerComponent } from './service-consumer.component';

describe('ServiceConsumerComponent', () => {
  let component: ServiceConsumerComponent;
  let fixture: ComponentFixture<ServiceConsumerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceConsumerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceConsumerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

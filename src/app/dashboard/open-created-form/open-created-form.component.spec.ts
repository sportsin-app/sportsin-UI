import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenCreatedFormComponent } from './open-created-form.component';

describe('OpenCreatedFormComponent', () => {
  let component: OpenCreatedFormComponent;
  let fixture: ComponentFixture<OpenCreatedFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenCreatedFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenCreatedFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponCodeFormComponent } from './coupon-code-form.component';

describe('CouponCodeFormComponent', () => {
  let component: CouponCodeFormComponent;
  let fixture: ComponentFixture<CouponCodeFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouponCodeFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouponCodeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

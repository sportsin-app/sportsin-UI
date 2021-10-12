import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TomTomMapComponent } from './tom-tom-map.component';

describe('TomTomMapComponent', () => {
  let component: TomTomMapComponent;
  let fixture: ComponentFixture<TomTomMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TomTomMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TomTomMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

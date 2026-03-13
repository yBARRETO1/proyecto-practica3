import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Generadores } from './generadores';

describe('Generadores', () => {
  let component: Generadores;
  let fixture: ComponentFixture<Generadores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Generadores],
    }).compileComponents();

    fixture = TestBed.createComponent(Generadores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

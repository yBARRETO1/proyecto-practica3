import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recolectores } from './recolectores';

describe('Recolectores', () => {
  let component: Recolectores;
  let fixture: ComponentFixture<Recolectores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recolectores],
    }).compileComponents();

    fixture = TestBed.createComponent(Recolectores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

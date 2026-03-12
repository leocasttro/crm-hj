import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaseConsultaPreOperatoria } from './fase-consulta-pre-operatoria';

describe('FaseConsultaPreOperatoria', () => {
  let component: FaseConsultaPreOperatoria;
  let fixture: ComponentFixture<FaseConsultaPreOperatoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaseConsultaPreOperatoria]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaseConsultaPreOperatoria);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteForm } from './paciente-form';

describe('PacienteForm', () => {
  let component: PacienteForm;
  let fixture: ComponentFixture<PacienteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacienteForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

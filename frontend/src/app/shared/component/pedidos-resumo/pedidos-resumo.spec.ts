import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosResumo } from './pedidos-resumo';

describe('PedidosResumo', () => {
  let component: PedidosResumo;
  let fixture: ComponentFixture<PedidosResumo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosResumo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidosResumo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

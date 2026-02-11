import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pedidos-resumo',
  imports: [CommonModule],
  standalone: true, // 🔥 OBRIGATÓRIO
  templateUrl: './pedidos-resumo.html',
  styleUrl: './pedidos-resumo.scss',
})
export class PedidosResumo {
  @Input() pedido!: any;
}

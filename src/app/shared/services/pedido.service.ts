import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoDto } from '../models/pedido.dto';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/pedidos';

  listar(): Observable<PedidoDto[]> {
    return this.http.get<PedidoDto[]>(this.baseUrl);
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoDto } from '../models/pedido.dto';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/pedidos`;

  listar(): Observable<PedidoDto[]> {
    return this.http.get<PedidoDto[]>(this.baseUrl);
  }

  importarPdf(arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('pdf', arquivo);

    return this.http.post(`${this.baseUrl}/importar-pdf`, formData);
  }
}

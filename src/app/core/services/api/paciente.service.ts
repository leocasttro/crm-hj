import { environment } from './../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { PacienteDto } from '@models/paciente';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private baseUrl = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient) {}

  buscarPorId(id: string): Observable<PacienteDto> {
    return this.http.get<PacienteDto>(`${this.baseUrl}/${id}`);
  }

  buscarPorIds(ids: string[]): Observable<PacienteDto[]> {
    const unique = [...new Set(ids)].filter(Boolean);
    if (unique.length === 0) return of([]);
    return forkJoin(unique.map((id) => this.buscarPorId(id)));
  }
}

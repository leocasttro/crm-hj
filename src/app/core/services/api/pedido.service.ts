import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoDto } from '@models/pedido';
import { environment } from '@env/environment';

export interface AnalisarPedidoRequest {
  aprovado: boolean;
  observacao?: string;
  motivoRejeicao?: string;
}

export interface AtualizarStatusResponse {
  sucesso: boolean;
  mensagem: string;
  pedido: PedidoDto;
}

// Interfaces para o checklist
export interface UploadArquivoResponse {
  sucesso: boolean;
  mensagem: string;
  arquivoId?: string;
  url?: string;
  nomeArquivo?: string;
}

export interface ArquivoInfoResponse {
  url: string;
  nomeArquivo: string;
  contentType: string;
  tamanho: number;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/pedidos`;

  // ==================== MÉTODOS EXISTENTES ====================

  listar(): Observable<PedidoDto[]> {
    return this.http.get<PedidoDto[]>(this.baseUrl);
  }

  buscarPorId(id: string): Observable<PedidoDto> {
    return this.http.get<PedidoDto>(`${this.baseUrl}/${id}`);
  }

  importarPdf(arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('pdf', arquivo);
    return this.http.post(`${this.baseUrl}/importar-pdf`, formData);
  }

  atualizarPedido(id: string, dados: any): Observable<any> {
    console.log('🔧 Service - atualizarPedido chamado com ID:', id);
    return this.http.put(`${this.baseUrl}/${id}`, dados);
  }

  iniciarAnalise(id: string): Observable<PedidoDto> {
    console.log('🔧 Service - iniciarAnalise chamado com ID:', id);
    return this.http.post<PedidoDto>(`${this.baseUrl}/${id}/analise/iniciar`, {});
  }

  analisarPedido(id: string, request: AnalisarPedidoRequest): Observable<AtualizarStatusResponse> {
    console.log('🔧 Service - analisarPedido chamado com ID:', id, 'Request:', request);
    return this.http.post<AtualizarStatusResponse>(`${this.baseUrl}/${id}/analise`, request);
  }

  aprovarPedido(id: string, observacao?: string): Observable<AtualizarStatusResponse> {
    return this.analisarPedido(id, {
      aprovado: true,
      observacao: observacao || 'Pedido aprovado'
    });
  }

  reprovarPedido(id: string, motivo: string, observacao?: string): Observable<AtualizarStatusResponse> {
    return this.analisarPedido(id, {
      aprovado: false,
      observacao: observacao || 'Pedido reprovado',
      motivoRejeicao: motivo
    });
  }

  agendarPedido(id: string, dadosAgendamento: any): Observable<PedidoDto> {
    console.log('🔧 Service - agendarPedido chamado com ID:', id);
    return this.http.patch<PedidoDto>(`${this.baseUrl}/${id}/agendar`, dadosAgendamento);
  }

  podeEditar(id: string): Observable<{ podeEditar: boolean; statusAtual: string }> {
    return this.http.get<{ podeEditar: boolean; statusAtual: string }>(
      `${this.baseUrl}/${id}/pode-editar`
    );
  }

  atualizarStatus(id: string, status: string): Observable<PedidoDto> {
    console.log('🔧 Service - atualizarStatus chamado com ID:', id, 'Status:', status);
    return this.http.patch<PedidoDto>(`${this.baseUrl}/${id}/status`, { status });
  }

  // ==================== NOVOS MÉTODOS PARA CHECKLIST ====================

  /**
   * Upload de arquivo para um item do checklist
   */
  uploadArquivoChecklist(formData: FormData): Observable<UploadArquivoResponse> {
    const pedidoId = formData.get('pedidoId') as string;
    return this.http.post<UploadArquivoResponse>(
      `${this.baseUrl}/${pedidoId}/arquivos`,
      formData
    );
  }

  /**
   * Download de arquivo do checklist
   */
  downloadArquivoChecklist(pedidoId: string, itemId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${pedidoId}/arquivos/${itemId}`, {
      responseType: 'blob'
    });
  }

  /**
   * Obter URL para download do arquivo
   */
  getUrlArquivoChecklist(pedidoId: string, itemId: number): Observable<ArquivoInfoResponse> {
    return this.http.get<ArquivoInfoResponse>(
      `${this.baseUrl}/${pedidoId}/arquivos/${itemId}/info`
    );
  }

  /**
   * Deletar arquivo do checklist
   */
  deletarArquivoChecklist(pedidoId: string, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${pedidoId}/arquivos/${itemId}`);
  }

  /**
   * Atualizar observação de um item do checklist
   */
  atualizarObservacaoChecklist(pedidoId: string, itemId: number, observacao: string): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/${pedidoId}/checklist/${itemId}`,
      { observacao }
    );
  }

  /**
   * Marcar item do checklist como concluído
   */
  concluirItemChecklist(pedidoId: string, itemId: number): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/${pedidoId}/checklist/${itemId}/concluir`,
      {}
    );
  }

  /**
   * Abrir URL do arquivo em nova aba (download)
   */
  abrirArquivo(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * Download do arquivo como blob
   */
  async downloadArquivoComoBlob(pedidoId: string, itemId: number, nomeArquivo: string): Promise<void> {
    try {
      const blob = await this.downloadArquivoChecklist(pedidoId, itemId).toPromise();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomeArquivo;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      throw error;
    }
  }
}

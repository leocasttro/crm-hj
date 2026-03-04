// src/app/core/services/toast.service.ts
import { Injectable, Injector } from '@angular/core';

declare var bootstrap: any;

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  success(message: string, title: string = 'Sucesso', timeout: number = 3000): void {
    this.show(message, title, 'success', timeout);
  }

  error(message: string, title: string = 'Erro', timeout: number = 3000): void {
    this.show(message, title, 'error', timeout);
  }

  warning(message: string, title: string = 'Atenção', timeout: number = 3000): void {
    this.show(message, title, 'warning', timeout);
  }

  info(message: string, title: string = 'Informação', timeout: number = 3000): void {
    this.show(message, title, 'info', timeout);
  }

  private show(message: string, title: string, type: ToastType, timeout: number): void {
    const toastContainer = document.getElementById('toast-container') || this.createToastContainer();

    const toastId = 'toast-' + new Date().getTime();
    const bgColor = this.getBgColor(type);
    const icon = this.getIcon(type);

    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-white ${bgColor} border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="true" data-bs-delay="${timeout}">
        <div class="d-flex">
          <div class="toast-body">
            <strong><i class="bi ${icon} me-2"></i>${title}</strong><br>
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    const toastElement = document.getElementById(toastId);
    if (toastElement) {
      const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: timeout
      });

      toast.show();

      // Remove do DOM após esconder
      toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
      });
    }
  }

  private createToastContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
  }

  private getBgColor(type: ToastType): string {
    switch (type) {
      case 'success': return 'bg-success';
      case 'error': return 'bg-danger';
      case 'warning': return 'bg-warning';
      case 'info': return 'bg-info';
      default: return 'bg-primary';
    }
  }

  private getIcon(type: ToastType): string {
    switch (type) {
      case 'success': return 'bi-check-circle-fill';
      case 'error': return 'bi-x-circle-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      case 'info': return 'bi-info-circle-fill';
      default: return 'bi-bell-fill';
    }
  }
}

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@services/api';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  // Não adiciona token no endpoint de login
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  // Adiciona token se existir
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });

    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        // Verifica se é erro 401 com código de token expirado
        if (error.status === 401 && error.error?.code === 'TOKEN_EXPIRED') {
          console.log('Token expirado, fazendo logout automático');

          // Apenas desloga e redireciona para login
          auth.logout();
          router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }

  return next(req);
};

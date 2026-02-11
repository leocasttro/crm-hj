import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  loading = false;
  error: string | null = null;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]],
    });
  }

  submit() {
    this.error = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const payload = this.form.getRawValue() as { email: string; senha: string };

    this.auth.login(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/cirurgias']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Falha ao autenticar';
      },
    });
  }
}

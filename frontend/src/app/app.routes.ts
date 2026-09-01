import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/registro/registro.component').then((m) => m.RegistroComponent)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'inicio'
      },
      {
        path: 'inicio',
        loadComponent: () => import('./features/inicio/inicio.component').then((m) => m.InicioComponent)
      },
      {
        path: 'saldo',
        loadComponent: () => import('./features/saldo/saldo.component').then((m) => m.SaldoComponent)
      },
      {
        path: 'remanejamentos',
        loadComponent: () =>
          import('./features/remanejamentos/remanejamentos.component').then((m) => m.RemanejamentosComponent)
      },
      {
        path: 'contratos',
        loadComponent: () => import('./features/contratos/contratos.component').then((m) => m.ContratosComponent)
      },
      {
        path: 'pagamentos',
        loadComponent: () => import('./features/pagamentos/pagamentos.component').then((m) => m.PagamentosComponent)
      },
      {
        path: 'previsoes',
        loadComponent: () => import('./features/previsoes/previsoes.component').then((m) => m.PrevisoesComponent)
      },
      {
        path: 'siop',
        loadComponent: () => import('./features/siop/siop.component').then((m) => m.SiopComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

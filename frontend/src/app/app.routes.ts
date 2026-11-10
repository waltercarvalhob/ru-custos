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
        path: 'pagamentos',
        loadComponent: () => import('./features/pagamentos/pagamentos.component').then((m) => m.PagamentosComponent)
      },
      {
        path: 'financeiro-bolsas-auxilios',
        loadComponent: () => import('./features/auxilios/auxilios.component').then((m) => m.AuxiliosComponent)
      },
      {
        path: 'orcamento-ru',
        loadComponent: () => import('./features/orcamento/orcamento.component').then((m) => m.OrcamentoComponent),
        data: { setor: 'RU' }
      },
      {
        path: 'orcamento-bolsas-auxilios',
        loadComponent: () => import('./features/orcamento/orcamento.component').then((m) => m.OrcamentoComponent),
        data: { setor: 'AUXILIOS' }
      },
      {
        path: 'siop',
        loadComponent: () => import('./features/siop/siop.component').then((m) => m.SiopComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/usuarios/usuarios.component').then((m) => m.UsuariosComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

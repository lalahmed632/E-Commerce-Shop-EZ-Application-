import { Routes } from '@angular/router';
import { adminGuard, authGuard, customerGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page.component').then((m) => m.HomePageComponent),
    title: 'ShopEZ | Home'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login-page/login-page.component').then((m) => m.LoginPageComponent),
    title: 'ShopEZ | Login'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register-page/register-page.component').then((m) => m.RegisterPageComponent),
    title: 'ShopEZ | Register'
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products-page/products-page.component').then((m) => m.ProductsPageComponent),
    title: 'ShopEZ | Products'
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./pages/product-details-page/product-details-page.component').then((m) => m.ProductDetailsPageComponent),
    title: 'ShopEZ | Product Details'
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart-page/cart-page.component').then((m) => m.CartPageComponent),
    title: 'ShopEZ | Shopping Cart',
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout-page/checkout-page.component').then((m) => m.CheckoutPageComponent),
    title: 'ShopEZ | Checkout',
    canActivate: [customerGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders-page/orders-page.component').then((m) => m.OrdersPageComponent),
    title: 'ShopEZ | Orders',
    canActivate: [authGuard]
  },
  {
    path: 'admin/products',
    loadComponent: () => import('./pages/admin-products-page/admin-products-page.component').then((m) => m.AdminProductsPageComponent),
    title: 'ShopEZ | Admin Products',
    canActivate: [adminGuard]
  },
  { path: '**', redirectTo: '' }
];

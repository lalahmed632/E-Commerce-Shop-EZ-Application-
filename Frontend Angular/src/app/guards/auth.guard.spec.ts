import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard, authGuard, customerGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('auth guards', () => {
  const makeRouter = () => ({
    createUrlTree: jasmine.createSpy('createUrlTree').and.callFake((commands: unknown[], extras?: unknown) => ({
      commands,
      extras
    }))
  });

  it('authGuard allows logged-in users', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => true } },
        { provide: Router, useValue: makeRouter() }
      ]
    });

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, { url: '/cart' } as never));
    expect(result).toBeTrue();
  });

  it('authGuard redirects anonymous users to login with returnUrl', () => {
    const router = makeRouter();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => false } },
        { provide: Router, useValue: router }
      ]
    });

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, { url: '/orders' } as never));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/orders' } });
    expect(result).toBeTruthy();
  });

  it('adminGuard redirects non-admin users to login', () => {
    const router = makeRouter();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => true, isAdmin: () => false } },
        { provide: Router, useValue: router }
      ]
    });

    const result = TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/admin/products' } });
    expect(result).toBeTruthy();
  });

  it('customerGuard redirects admins away from checkout', () => {
    const router = makeRouter();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => true, isAdmin: () => true } },
        { provide: Router, useValue: router }
      ]
    });

    const result = TestBed.runInInjectionContext(() => customerGuard({} as never, { url: '/checkout' } as never));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/admin/products']);
    expect(result).toBeTruthy();
  });
});

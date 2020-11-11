import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(public auth: AuthService, public router: Router) { }
  canActivate(): boolean {
    // console.log(this.auth.isLoggedIn())
    if (!this.auth.isLoggedIn()){
      this.router.navigate(['login'])
    }
    return true
  }
}

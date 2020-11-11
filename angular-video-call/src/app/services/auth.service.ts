import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ILogin } from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  roleType = ['user', 'admin']
  role = new BehaviorSubject(null)

  private roleURL = `${environment.endpoint}/role`
  private loginURL = `${environment.endpoint}/login`

  constructor(
    private httpClient: HttpClient
  ) { }

  // * Verify that token is valid
  isLoggedIn(): boolean{
    return !!sessionStorage.getItem('token')
  }

  // * Get role
  getRole(){
    return this.httpClient.get<{role: string}>(this.roleURL)
    .pipe(take(1))
    .subscribe(
      res => {
        // console.log(res)
        this.role.next(res.role)
      }
    )
  }

  // * Login
  login(dto: ILogin) {
    return this.httpClient.post<{result: boolean, token: string}>(this.loginURL, dto)
  }
}

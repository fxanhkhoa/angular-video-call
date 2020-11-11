import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup
  hide = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.initForm()
    
  }

  initForm(){
    this.form = new FormGroup({
      email: new FormControl('supporter1@gmail.com', [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl('123', [
        Validators.required
      ])
    })
  }

  login(){
    this.spinner.show('sp1')
    if (this.form.valid){
      this.authService.login(this.form.value)
      .subscribe(
        res => {
          console.log(res)
          if (res.result){
            sessionStorage.setItem('token', res.token)
            sessionStorage.setItem('email', this.form.controls['email'].value)
            this.authService.getRole()
            this.spinner.hide('sp1')
            this.router.navigate(['home'])
          }
        }
      )
    }
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth.data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })

export class AuthService {
  private token: string;
  private authStatusListener = new Subject<boolean>();
  private isAuth: boolean = false;
  private tokenTimer: any;
  constructor(private http: HttpClient, private router: Router) {}

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http.post("http://localhost:3000/api/user/signup", authData).subscribe(response => {
      console.log(response);
    });
  }


  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http.post <{token: string, expiresIn: number}>("http://localhost:3000/api/user/login", authData).subscribe(response => {
      const token = response.token;
      this.token = token;
      if (token) {
        const expiresInDuration = response.expiresIn;
        this.setAuthTimer(expiresInDuration);
        this.isAuth = true;
        this.authStatusListener.next(true);
        const curDate = new Date();
        const expDate = new Date(curDate.getTime() + (expiresInDuration * 1000));
        this.saveAuthData(token, expDate);
        this.router.navigate(['/']);
      }
    });
  }

  logout() {
    this.token = null;
    this.isAuth = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }
  
  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    const curDate = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - curDate.getTime();
    //if greater than 0, it is in future
    if (expiresIn > 0) {
      this.token = authInfo.token;
      this.isAuth = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
    
  }

  getAuthStatus() {
    return this.isAuth;
  }

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(
      () => { 
        this.logout();
      }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expDate = localStorage.getItem("expiration");
    if (!token || !expDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expDate),
    }
  }
}
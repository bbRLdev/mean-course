import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth.data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiURL + "/user/";
@Injectable({ providedIn: 'root' })

export class AuthService {
  private token: string;
  private authStatusListener = new Subject<boolean>();
  private isAuth: boolean = false;
  private tokenTimer: any;
  private userId: string;
  constructor(private http: HttpClient, private router: Router) {}

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http.post(BACKEND_URL + "signup", authData).subscribe(
      response => {
        this.router.navigate(['/']);
      }, error => {
        this.authStatusListener.next(false);
      }
    );
  }


  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http.post <{token: string, expiresIn: number, userId: string}>(BACKEND_URL + "login", authData).subscribe(
      response => {
        const token = response.token;
        this.token = token;
        if (token) {
          this.userId = response.userId;
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuth = true;
          this.authStatusListener.next(true);
          const curDate = new Date();
          const expDate = new Date(curDate.getTime() + (expiresInDuration * 1000));
          this.saveAuthData(token, expDate, this.userId);
          this.router.navigate(['/']);
        }
      }, error => {
        this.authStatusListener.next(false);
      }
    );
  }

  logout() {
    this.token = null;
    this.isAuth = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
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
      this.userId = authInfo.userId;
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

  getUserId() {
    return this.userId;
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(
      () => { 
        this.logout();
      }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("expiration", expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("expiration");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");

    if (!token || !expDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expDate),
      userId: userId,
    }
  }
}
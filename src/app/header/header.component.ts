import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  userIsAuth: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.userIsAuth = this.authService.getAuthStatus();
    this.authSub = this.authService.getAuthStatusListener().subscribe(
      (isAuthenticated) => {
        this.userIsAuth = isAuthenticated;
        
      }
    );

  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }

}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //   { title: "Post 1", content: "Post 1 Content" },
  //   { title: "Post 2", content: "Post 2 Content" },
  //   { title: "Post 3", content: "Post 3 Content" },

  // ];
  posts: Post[] = [];
  isLoading: boolean = false;
  totalPosts: number = 0;
  postsPerPage: number = 2;
  pageSizeOptions: number[] = [1, 2, 5, 10];
  currentPage = 1;
  userIsAuth: boolean = false;
  userId: string;
  private postServiceSubscription: Subscription;
  private authServiceSub: Subscription;


  constructor(private postsService: PostsService, private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postServiceSubscription = this.postsService.getPostUpdateListener().subscribe(
      (postData: {posts: Post[], postCount: number}) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
        
      }
    );
    this.userIsAuth = this.authService.getAuthStatus();
    this.authServiceSub = this.authService.getAuthStatusListener().subscribe(
      (authStatus) => {
        this.userIsAuth = authStatus;
        this.userId = this.authService.getUserId();
      }
    );

  }
  ngOnDestroy() {
    this.postServiceSubscription.unsubscribe();
    this.authServiceSub.unsubscribe();
  }

  onDelete(id: string) {
    this.isLoading = true;
    this.postsService.deletePost(id).subscribe(
      () => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      }
    );

  }

  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  
  }

}

import { Component, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {


  private createMode: boolean = true;
  private postId: string;
  post: Post;
  imagePreview: string;

  createPostForm: FormGroup;

  isLoading = false;

  constructor(private postsService: PostsService, public activatedRoute: ActivatedRoute) { }
  onSavePost() {
    if (this.createPostForm.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.createMode) {
      this.postsService.addPost(this.createPostForm.value.title, this.createPostForm.value.content, this.createPostForm.value.image);
      this.createPostForm.reset();
    } else {
      this.postsService.updatePost(this.post.id, this.createPostForm.value.title, this.createPostForm.value.content, this.createPostForm.value.image);
    }
    this.createPostForm.reset();

  }

  onImageSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.createPostForm.patchValue({ image: file });
    this.createPostForm.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = <string> reader.result;
    }
    reader.readAsDataURL(file);


  }

  ngOnInit(): void {
    this.createPostForm = new FormGroup({
      'title': new FormControl(null, { validators: [Validators.required, Validators.minLength(6)] }),
      'content': new FormControl(null, { validators: [Validators.required, Validators.minLength(10)] }),
      'image': new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType]} ),

    });
    this.activatedRoute.paramMap.subscribe(
      (paramMap: ParamMap) => {
        if (paramMap.has('postId')) {
          this.createMode = false;
          this.postId = paramMap.get('postId');
          this.isLoading = true;
          this.postsService.getPost(this.postId).subscribe((postData) => {
            this.post = { id: postData._id, title: postData.title, content: postData.content, imagePath: postData.imagePath, creator: postData.creator };
            this.isLoading = false;
            this.createPostForm.setValue({'title': this.post.title, 'content': this.post.content, 'image': this.post.imagePath});

          });
        } else {
          this.createMode = true;
          this.postId = null;
          this.post = null;
        }

      }
    );
  }

}

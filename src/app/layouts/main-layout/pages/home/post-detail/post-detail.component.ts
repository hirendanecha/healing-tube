import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MetafrenzyService } from 'ngx-metafrenzy';
import { NgxSpinnerService } from 'ngx-spinner';
import { PostService } from 'src/app/@shared/services/post.service';
import { SeoService } from 'src/app/@shared/services/seo.service';
import { SharedService } from 'src/app/@shared/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
  providers: [MetafrenzyService]
})
export class PostDetailComponent implements OnInit {

  postId: string = '';
  post: any = {};

  constructor(
    private spinner: NgxSpinnerService,
    private postService: PostService,
    public sharedService: SharedService,
    private route: ActivatedRoute,
    private seoService: SeoService,
    private metafrenzyService: MetafrenzyService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.postId = this.route.snapshot.paramMap.get('id');
      // console.log('route', this.route);
      if (this.postId) {
        this.getPostsByPostId();
      }
    }
  }

  ngOnInit(): void {

  }

  getPostsByPostId(): void {
    this.spinner.show();

    this.postService.getPostsByPostId(this.postId).subscribe(
      {
        next: (res: any) => {
          this.spinner.hide();
          if (res?.[0]) {
            this.post = res?.[0];
            const html = document.createElement('div');
            html.innerHTML =
              this.post?.postdescription || this.post?.metadescription;
            const data = {
              title: this.post?.title,
              url: `${environment.webUrl}post/${this.postId}`,
              description: html.textContent,
              image: this.post?.imageUrl,
              video: this.post?.streamname,
            };
            this.metafrenzyService.setTitle(data.title);
            this.metafrenzyService.setOpenGraph({
              title: data.title,
              //description: post.postToProfileIdName === '' ? post.profileName: post.postToProfileIdName,
              description: html.textContent,
              url: data.url,
              image: data.image,
              site_name: 'healing.tube'
            });
            // this.seoService.updateSeoMetaData(data, true);
          }
        },
        error:
          (error) => {
            this.spinner.hide();
            console.log(error);
          }
      });
  }
}

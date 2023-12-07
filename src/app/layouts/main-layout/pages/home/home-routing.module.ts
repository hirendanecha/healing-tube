import { NgModule } from '@angular/core';
import { RouterModule, Routes, mapToCanActivate } from '@angular/router';
import { HomeComponent } from './home.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { AuthenticationGuard } from 'src/app/@shared/guards/authentication.guard';
import { MetafrenzyGuard } from 'ngx-metafrenzy';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: mapToCanActivate([MetafrenzyGuard]),
    data: {
      metafrenzzy: {
        title: 'Home',
        tags: [
          {
            name: 'og:title',
            content: 'Healing tube Home Page',
          },
          {
            name: 'og:description',
            content: 'Welcome to Healing tube home page',
          },
          {
            name: 'og:url',
            content: window.location.href,
          },
          {
            name: 'og:image',
            content:
              'https://healing.tube/assets/images/banner/Healing-Tube-Logo.png',
          },
        ],
        links: [
          {
            rel: 'canonical',
            href: window.location.href,
          },
        ],
      },
    },
  },
  {
    path: 'communities/:name',
    component: HomeComponent,
    canActivate: mapToCanActivate([MetafrenzyGuard, AuthenticationGuard]),
    data: {
      metafrenzzy: {
        title: 'Health Practitioner',
        tags: [
          {
            name: 'og:title',
            content: 'Healing tube Health Practitioner',
          },
          {
            name: 'og:description',
            content: 'Health Practitioner',
          },
          {
            name: 'og:url',
            content: window.location.href,
          },
          {
            name: 'og:image',
            content:
              'https://healing.tube/assets/images/healing-community.png',
          },
        ],
        links: [
          {
            rel: 'canonical',
            href: window.location.href,
          },
        ],
      },
    },
  },
  {
    path: 'pages/:name',
    component: HomeComponent,
    canActivate: mapToCanActivate([AuthenticationGuard, MetafrenzyGuard]),
    data: {
      metafrenzzy: {
        title: 'Pages',
        tags: [
          {
            name: 'og:title',
            content: 'Health Topics',
          },
          {
            name: 'og:description',
            content: 'Healing tube Health Topics',
          },
          {
            name: 'og:url',
            content: window.location.href,
          },
          {
            name: 'og:image',
            content: 'https://healing.tube/assets/images/healing-pages.png',
          },
        ],
        links: [
          {
            rel: 'canonical',
            href: window.location.href,
          },
        ],
      },
    },
  },
  {
    path: 'post/:id',
    component: PostDetailComponent,
    canActivate: mapToCanActivate([MetafrenzyGuard]),
    data: {
      metafrenzzy: {
        title: 'Posts',
        tags: [
          {
            name: 'og:title',
            content: 'Freedom Feed Posts',
          },
          {
            name: 'og:description',
            content: 'Healing Tube local News Feed Posts',
          },
          {
            name: 'og:url',
            content: window.location.href,
          },
          {
            name: 'og:image',
            content: 'https://healing.tube/assets/images/healing-post.png',
          },
        ],
        links: [
          {
            rel: 'canonical',
            href: window.location.href,
          },
        ],
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule { }

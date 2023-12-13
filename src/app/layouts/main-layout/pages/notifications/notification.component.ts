import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { CustomerService } from 'src/app/@shared/services/customer.service';
import { SeoService } from 'src/app/@shared/services/seo.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationsComponent {
  notificationList: any[] = [];

  constructor(
    private customerService: CustomerService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private toastService: ToastService,
    private seoService: SeoService
  ) { 
    const data = {
      title: 'Freedom.Buzz Notification',
      url: `${location.href}`,
      description: '',
    };
    this.seoService.updateSeoMetaData(data);
  }

  ngOnInit(): void {
    this.getNotificationList();
  }

  getNotificationList() {
    this.spinner.show();
    const id = localStorage.getItem('profileId');
    this.customerService.getNotificationList(Number(id)).subscribe(
      {
        next: (res: any) => {
          this.spinner.hide();
          this.notificationList = res?.data;
        },
        error:
          (error) => {
            this.spinner.hide();
            console.log(error);
          }
      });
  }

  viewUserPost(id) {
    this.router.navigate([`post/${id}`]);
  }

  removeNotification(id: number): void {
    this.customerService.deleteNotification(id).subscribe({
      next: (res: any) => {
        this.toastService.success(res.message || 'Notification delete successfully');
        this.getNotificationList();
      },
    });
  }

  readUnreadNotification(id, isRead): void {
    this.customerService.readUnreadNotification(id, isRead).subscribe({
      next: (res) => {
        this.toastService.success(res.message);
        this.getNotificationList();
      },
    });
  }
}

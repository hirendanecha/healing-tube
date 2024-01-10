import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, forkJoin, fromEvent } from 'rxjs';
import { slugify } from 'src/app/@shared/utils/utils';
import { Community } from 'src/app/@shared/constant/customer';
import { CommunityService } from 'src/app/@shared/services/community.service';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { environment } from 'src/environments/environment';
import { CustomerService } from 'src/app/@shared/services/customer.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UploadFilesService } from 'src/app/@shared/services/upload-files.service';
import { Router } from '@angular/router';
import { OpenStripeComponent } from 'src/app/@shared/modals/open-stripe/open-stripe.component';

@Component({
  selector: 'app-add-community-modal',
  templateUrl: './add-community-modal.component.html',
  styleUrls: ['./add-community-modal.component.scss'],
})
export class AddCommunityModalComponent implements OnInit, AfterViewInit {
  @Input() title: string | undefined = 'Apply to be Health Practitioner';
  @Input() cancelButtonLabel: string | undefined = 'Cancel';
  @Input() confirmButtonLabel: string | undefined = 'Create';
  @Input() closeIcon: boolean | undefined;
  @Input() data: any = [];
  @ViewChild('zipCode') zipCode: ElementRef;

  communityDetails = new Community();
  submitted = false;
  registrationMessage = '';
  selectedFile: File;
  userId = '';
  profileId = '';
  originUrl = environment.webUrl + 'health-practitioner/';
  logoImg: any = {
    file: null,
    url: '',
  };
  coverImg: any = {
    file: null,
    url: '',
  };
  allCountryData: any;
  defaultCountry = 'US';

  practitionerArea: any = [];
  practitionerEmphasis: any = [];
  selectedValues: number[] = [];
  selectedAreaValues: number[] = [];

  communityForm = new FormGroup({
    profileId: new FormControl(),
    CommunityName: new FormControl(''),
    CommunityDescription: new FormControl(''),
    slug: new FormControl('', [Validators.required]),
    pageType: new FormControl('community', [Validators.required]),
    isApprove: new FormControl('N', [Validators.required]),
    Country: new FormControl('US', [Validators.required]),
    Zip: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    State: new FormControl({ value: '', disabled: true }, Validators.required),
    City: new FormControl({ value: '', disabled: true }, Validators.required),
    County: new FormControl({ value: '', disabled: true }, Validators.required),
    logoImg: new FormControl('', Validators.required),
    coverImg: new FormControl('', Validators.required),
  });

  pricingPage: boolean;
  totalAmt: number;
  selectedCards: any[] = [];
  cards: any[] = [
    {
      title: '600 Minutes of Video Time',
      id: 1,
      description: `600 minutes of video call time provides enough minutes for twenty 30-minute consultation calls per month.`,
      pricing: `$30.00 per month`,
      rate: 30,
    },
    {
      title: '3000 Minutes of Video Time',
      id: 2,
      description: `3000 minutes of video call time provides enough minutes for one hundred 30-minute consultation calls per month.`,
      pricing: `$120.00 per month`,
      rate: 120,
    },
    {
      title: '6000 Minutes of Video Time',
      id: 3,
      description: `6000 minutes of video call time provides enough minutes for two hundred 30-minute consultation calls per month.`,
      pricing: `$200.00 per month`,
      rate: 200,
    },
  ];

  featuredCards: any[] = [
    {
      title: 'Dedicated Server and Unlimited Minutes of Video Call Time',
      id: 11,
      description: `A dedicated server provides an unlimited number of call time minutes.
      Pricing is dependent on the selected server.
      Please contact us for details.`,
      pricing: `(auto email to sales@healing.tube)`,
      rate: 0,
    },
    {
      title: 'Featured Practitioner',
      id: 22,
      description: `Become a Featured Practitioner and your practice will be featured throughout Healing.tube`,
      pricing: `$100.00 per month`,
      rate: 100,
    },
  ];

  constructor(
    public activeModal: NgbActiveModal,
    private spinner: NgxSpinnerService,
    private communityService: CommunityService,
    private toastService: ToastService,
    private customerService: CustomerService,
    private uploadService: UploadFilesService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.userId = window.sessionStorage.user_id;
    this.profileId = localStorage.getItem('profileId');
  }

  ngOnInit(): void {
    this.getAllCountries();
    this.getCategories();

    if (this.data.Id) {
      this.communityForm.patchValue({
        profileId: this.data?.profileId,
        CommunityName: this.data?.CommunityName,
        CommunityDescription: this.data?.CommunityDescription,
        slug: this.data?.slug,
        pageType: this.data?.pageType,
        isApprove: this.data?.isApprove,
        Country: this.data?.Country,
        Zip: this.data?.Zip,
        State: this.data?.State,
        City: this.data?.City,
        address: this.data?.City,
        County: this.data?.County,
        logoImg: this.data?.logoImg,
        coverImg: this.data?.coverImg,
      });
      this.communityForm.get('State').enable();
      this.communityForm.get('City').enable();
      this.communityForm.get('County').enable();
      console.log(this.data);
    }
  }

  ngAfterViewInit(): void {
    fromEvent(this.zipCode.nativeElement, 'input')
      .pipe(debounceTime(1000))
      .subscribe((event) => {
        const val = event['target'].value;
        if (val.length > 3) {
          this.onZipChange(val);
        }
      });
  }

  uploadImgAndSubmit(): void {
    this.communityForm.get('profileId').setValue(this.profileId);
    let uploadObs = {};
    if (this.logoImg?.file?.name) {
      uploadObs['logoImg'] = this.uploadService.uploadFile(this.logoImg?.file);
    }

    if (this.coverImg?.file?.name) {
      uploadObs['coverImg'] = this.uploadService.uploadFile(
        this.coverImg?.file
      );
    }

    if (Object.keys(uploadObs)?.length > 0) {
      this.spinner.show();

      forkJoin(uploadObs).subscribe({
        next: (res: any) => {
          if (res?.logoImg?.body?.url) {
            this.logoImg['file'] = null;
            this.logoImg['url'] = res?.logoImg?.body?.url;
            this.communityForm.get('logoImg').setValue(res?.logoImg?.body?.url);
          }

          if (res?.coverImg?.body?.url) {
            this.coverImg['file'] = null;
            this.coverImg['url'] = res?.coverImg?.body?.url;
            this.communityForm
              .get('coverImg')
              .setValue(res?.coverImg?.body?.url);
          }

          this.spinner.hide();
          this.onSubmit();
        },
        error: (err) => {
          this.spinner.hide();
        },
      });
    } else {
      this.onSubmit();
    }
  }

  onSubmit() {
    if (!this.data.Id) {
      this.spinner.show();
      const formData = this.communityForm.value;
      formData['emphasis'] = this.selectedValues;
      formData['areas'] = this.selectedAreaValues;
      if (this.communityForm.valid) {
        this.communityService.createCommunity(formData).subscribe({
          next: (res: any) => {
            this.spinner.hide();
            if (!res.error) {
              this.submitted = true;
              this.createCommunityAdmin(res.data);
              this.nextToApplication()
              // this.toastService.success(
              //   'Your Health Practitioner will be approved within 24 hours!'
              // );
              this.activeModal.close('success');
              // this.router.navigate(['/health-practitioner']);
            }
          },
          error: (err) => {
            this.toastService.danger(
              'Please change practitioner. this practitioner name already in use.'
            );
            this.spinner.hide();
          },
        });
      } else {
        this.spinner.hide();
        this.toastService.danger('Please enter mandatory fields(*) data.');
      }
    }
    if (this.communityForm.valid && this.data.Id) {
      this.communityService
        .editCommunity(this.communityForm.value, this.data.Id)
        .subscribe({
          next: (res: any) => {
            this.spinner.hide();
            if (!res.error) {
              this.submitted = true;
              // this.createCommunityAdmin(res.data);
              this.toastService.success(
                'Your Health Practitioner edit successfully!'
              );
              this.activeModal.close('success');
            }
          },
          error: (err) => {
            this.toastService.danger(
              'Please change Health Practitioner. this Health Practitioner name already in use.'
            );
            this.spinner.hide();
          },
        });
    }
  }

  createCommunityAdmin(id): void {
    const data = {
      profileId: this.profileId,
      communityId: id,
      isActive: 'Y',
      isAdmin: 'Y',
    };
    this.communityService.joinCommunity(data).subscribe({
      next: (res: any) => {
        if (res) {
          return res;
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  onCommunityNameChange(): void {
    const slug = slugify(this.communityForm.get('CommunityName').value);
    this.communityForm.get('slug').setValue(slug);
  }

  onLogoImgChange(event: any): void {
    this.logoImg = event;
  }

  onCoverImgChange(event: any): void {
    this.coverImg = event;
  }

  getAllCountries() {
    this.spinner.show();

    this.customerService.getCountriesData().subscribe({
      next: (result) => {
        this.spinner.hide();
        this.allCountryData = result;
        this.communityForm.get('Zip').enable();
      },
      error: (error) => {
        this.spinner.hide();
        console.log(error);
      },
    });
  }

  changeCountry() {
    this.communityForm.get('Zip').setValue('');
    this.communityForm.get('State').setValue('');
    this.communityForm.get('City').setValue('');
    this.communityForm.get('County').setValue('');
    // this.registerForm.get('Place').setValue('');
  }

  onZipChange(event) {
    this.spinner.show();
    this.customerService
      .getZipData(event, this.communityForm.get('Country').value)
      .subscribe(
        (data) => {
          if (data[0]) {
            const zipData = data[0];
            this.communityForm.get('State').enable();
            this.communityForm.get('City').enable();
            this.communityForm.get('County').enable();
            this.communityForm.patchValue({
              State: zipData.state,
              City: zipData.city,
              County: zipData.places,
            });
          } else {
            this.communityForm.get('State').disable();
            this.communityForm.get('City').disable();
            this.communityForm.get('County').disable();
            this.toastService.danger(data?.message);
          }

          this.spinner.hide();
        },
        (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }

  getCategories() {
    this.communityService.getCategories().subscribe({
      next: (res) => {
        this.practitionerArea = res.area;
        this.practitionerEmphasis = res.emphasis;
      },
      error: (error) => {
        this.spinner.hide();
        console.log(error);
      },
    });
  }

  onCheckboxChange(event: any, emphasis: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selectedValues.push(emphasis.eId);
    } else {
      this.selectedValues = this.selectedValues.filter(
        (id) => id !== emphasis.eId
      );
    }
  }
  onAreaboxChange(event: any, area: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selectedAreaValues.push(area.aId);
    } else {
      this.selectedAreaValues = this.selectedAreaValues.filter(
        (id) => id !== area.aId
      );
    }
  }

  clearForm(){
    this.router.navigate(['/health-practitioner'])
  }

  isSelected(id: number): boolean {
    return this.selectedCards.includes(id);
  }

  selectCard(cardId: string, amt: number): void {
    this.totalAmt = amt;
    const index = this.selectedCards.indexOf(cardId);
    if (index === -1) {
      this.selectedCards = [cardId];
    } else {
      this.selectedCards = [];
      this.totalAmt = null;
    }
  }

  feturedSelectCard(cardId: string, amt: number): void {
    const index = this.selectedCards.indexOf(cardId);
    if (index === -1) {
      this.selectedCards.push(cardId);
      this.totalAmt = isNaN(this.totalAmt) ? amt : this.totalAmt + amt;
    } else {
      this.selectedCards = this.selectedCards.filter((id) => id !== cardId);
      this.totalAmt = this.totalAmt - amt;
    }
  }

  backToApplication() {
    this.pricingPage = false;
  }
  
  nextToApplication() {
    const selectedSlot = {
      selectedCard: this.selectedCards,
      totalAmt: this.totalAmt,
    };

    if (selectedSlot && !this.pricingPage) {
      this.pricingPage = true;
    } else if (selectedSlot.selectedCard.length > 0) {
      const modalRef = this.modalService.open(OpenStripeComponent, {
        centered: true,
        backdrop: 'static',
      });
      modalRef.componentInstance.title = 'Pay Bill';
      modalRef.componentInstance.confirmButtonLabel = 'Pay';
      modalRef.componentInstance.cancelButtonLabel = 'Cancel';
      modalRef.componentInstance.data = selectedSlot;
      modalRef.result.then((res) => {
        this.router.navigate(['/health-practitioner']);
      });
    } else {
      this.toastService.danger('Please select your preference for billing.');
    }
  }
}

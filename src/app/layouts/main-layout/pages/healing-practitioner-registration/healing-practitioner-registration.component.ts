import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CustomerService } from 'src/app/@shared/services/customer.service';
import { SeoService } from 'src/app/@shared/services/seo.service';
import { TokenStorageService } from 'src/app/@shared/services/token-storage.service';

@Component({
  selector: 'app-healing-practitioner-registration',
  templateUrl: './healing-practitioner-registration.component.html',
  styleUrls: ['./healing-practitioner-registration.component.scss'],
})
export class HealingPractitionerRegistrationComponent implements OnInit {
  profileId: number;

  allCountryData: any;
  selectedCountry = 'US';
  allStateData: any;
  selectedState = '';

  isCountryChecked: boolean = true;
  isWorldwideChecked: boolean = false;

  selectPractitionerPage: boolean;

  selectedCard = '';
  cards: any[] = [
    {
      title: 'Botanical Medicine',
      description: `Plant-based supplements, tinctures, and topical applications that
    assist the body in healing. These may include either western or
    oriental herbal formulas with time-honored traditional healing
    applications for various symptoms and conditions.`,
    },
    {
      title: 'Homeopathy',
      description: `Gentle effective therapy that utilizes a minute amount of a
    potentized substance to promote a beneficial healing response.`,
    },
    {
      title: 'Hydrotherapy',
      description: `An important healing modality in traditional naturopathic
    medicine. Hydrotherapy utilizes the therapeutic benefits of water.
    It includes application of cool or warm water in specialized
    compresses or baths.`,
    },
    {
      title: 'Nutritional Counseling',
      description: `Nutritional supplementation, dietary assessment, and advice in
    making the best food choices based on your unique health history
    and individual needs.`,
    },
    {
      title: 'Lifestyle Counseling',
      description: `Help in making new choices that are healthier for you physically,
    emotionally, and psychologically.`,
    },
    {
      title: 'Touch for Health',
      description: ` Touch for Health is a system of balancing posture, attitude and
    life energy to relieve stress, aches and pains, feel and function
    better, be more effective, clarify and achieve your goals and
    enjoy your life! Using a holistic approach we
    rebalance the body's energies and
    activate the body's intrinsic healing process so
    that the body can better heal itself, creating that sense of
    effortless effort, and being in the flow of Life.`,
    },
    {
      title: `German New Medicine, Spiritual, Psychosomatic or related healing modalities`,
      description: `Various paradigms of medicine, that recognizes the profound
    effects of how an individual's consciousness is reflected in their
    health and well-being. It involves awakening the body's inherent
    self-healing properties. German New Medicine is founded of medical
    discoveries of Dr. med. Ryke Geerd Hamer`,
    },
  ];

  constructor(
    private seoService: SeoService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private tokenStorage: TokenStorageService
  ) {
    const queryParams = this.route.snapshot.queryParams;
    const newParams = { ...queryParams };
    // console.log(newParams)
    // this.channelId = this.shareService?.channelData?.id;
    // this.route.queryParams.subscribe((params: any) => {
    //   console.log(params.channelId);
    if (newParams['token']) {
      const token = newParams['token'];
      this.tokenStorage.saveToken(token)
      delete newParams['token']
      const navigationExtras: NavigationExtras = {
        queryParams: newParams
      };
      this.router.navigate([], navigationExtras);
    }

    this.profileId = Number(localStorage.getItem('profileId'));
    const data = {
      title: 'HealingTube Registration',
      url: `${location.href}`,
      description: '',
    };
    this.seoService.updateSeoMetaData(data);
  }
  ngOnInit(): void {
    this.getAllCountries();
  }

  backPreview() {
    this.selectPractitionerPage = !this.selectPractitionerPage;
  }

  updateCheckbox(selectedOption: 'country' | 'worldwide') {
    if (selectedOption === 'country' && this.isWorldwideChecked) {
      this.isWorldwideChecked = false;
    } else if (selectedOption === 'worldwide' && this.isCountryChecked) {
      this.selectedCountry = '';
      this.selectedState = '';
      this.allStateData = null
      this.isCountryChecked = false;
    }
    console.log(selectedOption);
  }

  selectCard(card: any): void {
    this.selectedCard = card;
    console.log('Selected Card:', this.selectedCard);
  }

  changeCountry() {
    if (this.isCountryChecked) {
      this.getAllState();
    }
    console.log(`Selected Option: Country, Country: ${this.selectedCountry}, State: ${this.selectedState}`)
  }

  getAllCountries() {
    this.spinner.show();
    this.customerService.getCountriesData().subscribe({
      next: (result) => {
        this.spinner.hide();
        this.allCountryData = result;
        this.getAllState();
      },
      error: (error) => {
        this.spinner.hide();
        console.log(error);
      },
    });
  }

  getAllState() {
    this.spinner.show();
    const selectCountry = this.selectedCountry;
    this.customerService.getStateData(selectCountry).subscribe({
      next: (result) => {
        this.spinner.hide();
        this.allStateData = result;
      },
      error: (error) => {
        this.spinner.hide();
        console.log(error);
      },
    });
  }
}

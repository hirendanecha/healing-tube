import { Component, Injectable, Input, inject } from '@angular/core';
import { NgbActiveModal, NgbCalendar, NgbDateAdapter, NgbDateStruct, NgbDatepickerConfig, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {
  readonly DELIMITER = '-';

  fromModel(value: string | null): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): string | null {
    return date
      ? date.year + this.DELIMITER + date.month + this.DELIMITER + date.day
      : null;
  }
}

@Component({
  selector: 'app-appointment-modal',
  templateUrl: './appointment-modal.component.html',
  styleUrls: ['./appointment-modal.component.scss'],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
  ]
})
export class AppointmentModalComponent {
  @Input() cancelButtonLabel: string;
  @Input() confirmButtonLabel: string;
  @Input() title: string;
  @Input() closeIcon: boolean;
  model: string;
  timeSlot: any = [];
  today: any;
  currentDate = new Date().getDate();
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  isSelectedSlot = false;
  index: number
  constructor(
    public activeModal: NgbActiveModal,
    private ngbCalendar: NgbCalendar,
    private dateAdapter: NgbDateAdapter<any>,
    public calendar: NgbCalendar
  ) {
    this.today = this.dateAdapter.toModel(this.ngbCalendar.getToday())!;
    console.log(this.today)
    console.log(this.currentDate, this.currentMonth, this.currentYear,)
  }

  async generateTimeSlots(startTime, endTime, duration) {
    const timeSlots = [];

    // Convert start and end time to Date objects
    const startDate = new Date(`${this.model} ${startTime}`);
    const endDate = new Date(`${this.model} ${endTime}`);

    // Loop through the time range and generate time slots
    while (startDate < endDate) {
      const currentSlot = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      timeSlots.push(currentSlot);

      // Increment the current time by the specified duration
      startDate.setMinutes(startDate.getMinutes() + duration);
    }

    return timeSlots;
  }

  async selectDate() {
    this.timeSlot = await this.generateTimeSlots('09:00', '18:30', 15)
  }

  selectTime(time, i): void {
    console.log(time, i);
    if (this.index !== i) {
      this.index = i;
    }

  }

}

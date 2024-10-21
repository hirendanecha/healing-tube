import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from './safe.pipe';
import { GetImageUrlPipe } from './get-image-url.pipe';
import { CommaSeperatePipe } from './comma-seperate.pipe';
import { DateDayPipe } from '../services/date-day.pipe';
import { NoSanitizePipe } from './sanitize.pipe';
import { TruncatePipe, StripHtmlPipe } from './post-description.pipe';

@NgModule({
  declarations: [
    SafePipe,
    GetImageUrlPipe,
    CommaSeperatePipe,
    DateDayPipe,
    NoSanitizePipe,
    TruncatePipe,
    StripHtmlPipe,
  ],
  imports: [CommonModule],
  exports: [
    SafePipe,
    GetImageUrlPipe,
    CommaSeperatePipe,
    DateDayPipe,
    NoSanitizePipe,
    TruncatePipe,
    StripHtmlPipe,
  ],
})
export class PipeModule { }

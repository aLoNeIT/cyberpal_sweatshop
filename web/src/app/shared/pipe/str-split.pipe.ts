import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'strSplitPipe',
  standalone: false
})
export class StrSplitPipe implements PipeTransform {
  transform(value: string, args?: any): string {
    if (typeof value === 'string' && value.indexOf('-')) {
      if (args === 'key') {
        return value.split('-')[0];
      } else if (args === 'value') {
        return value.split('-')[1];
      } else {
        return value;
      }
    } else {
      return value;
    }
  }
}

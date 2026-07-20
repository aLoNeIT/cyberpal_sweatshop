import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'strStatePipe',
  standalone: false
})
export class StrStatePipe implements PipeTransform {
  transform(value: string, args: { old: any; new: any }): boolean {
    if (typeof value === 'string' && args) {
      if (args.new.hasOwnProperty(value)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}

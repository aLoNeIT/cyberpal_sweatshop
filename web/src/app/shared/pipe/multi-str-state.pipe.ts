import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'multiStrStatePipe',
  standalone: false
})
export class multiStrStatePipe implements PipeTransform {
  transform(arry: string[], args: { old: any; new: any }): boolean {
    let status = false;
    if (args) {
      for (const value of arry) {
        if (args.new.hasOwnProperty(value)) {
          status = true;
          break;
        }
      }
    }
    return status;
  }
}

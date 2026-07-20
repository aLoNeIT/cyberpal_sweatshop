import { DOCUMENT } from '@angular/common';
import { Component, Input, AfterViewInit, Output, EventEmitter, ViewChild, ElementRef, Inject } from '@angular/core';
import { concatAll, filter, map, takeUntil, throttleTime, Observable, fromEvent, withLatestFrom } from 'rxjs';

import { IEventEmitter } from '../../model/public-api';
import { SHARED_IMPORTS } from '@shared';

@Component({
  selector: 'yzb-ccc',
  imports: SHARED_IMPORTS,
  templateUrl: './yzb-ccc.component.html',
  styleUrls: ['./yzb-ccc.component.less']
})
export class YzbCCCComponent implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}
  // ui通话页面显示隐藏
  visibled = false;
  /**
   * 通话保持按钮文本
   */
  callHoldText = '通话保持';
  /**
   * 静音按钮文本
   */
  muteText = '静音';
  /**
   * 定位
   */
  position = {
    top: '80px',
    left: '80px'
  };
  //电话号码
  @Input() phoneNumber = '';
  //通话状态，对方接通改为'正在通话中'
  @Input() phoneState = '电话呼出中';
  //挂断显示隐藏
  @Input() closeSwitch = true;
  //通话保持显示隐藏
  @Input() callholdSwitch = false;
  //静音显示隐藏
  @Input() muteSwitch = false;
  /**
   * 挂断按钮点击事件
   */
  @Output() readonly hungUpEvent = new EventEmitter<IEventEmitter>();
  /**
   * 通话保持按钮点击事件
   */
  @Output() readonly callHoldEvent = new EventEmitter<IEventEmitter>();
  /**
   * 静音按钮点击事件
   */
  @Output() readonly muteEvent = new EventEmitter<IEventEmitter>();
  /**
   * 当前组件根元素引用
   */
  @ViewChild('component', { static: false }) box!: ElementRef;
  /**
   * 当前组件标题元素引用
   */
  @ViewChild('title', { static: false }) title!: ElementRef;
  /**
   * 鼠标按下事件
   */
  public mouseDown!: Observable<Event>;
  /**
   * 鼠标按键弹起事件
   */
  public mouseUp!: Observable<Event>;
  /**
   * 鼠标移动事件
   */
  public mouseMove!: Observable<Event>;

  ngAfterViewInit(): void {
    this.mouseDown = fromEvent(this.title.nativeElement, 'mousedown'); // 目标元素按下
    this.mouseMove = fromEvent(this.document, 'mousemove'); // 元素在文档内移动
    this.mouseUp = fromEvent(this.document, 'mouseup'); // 鼠标抬起
    this.moveFn();
  }
  /**
   * 初始化移动窗体相关事件
   */
  public moveFn() {
    this.mouseDown
      .pipe(
        map(() =>
          this.mouseMove.pipe(
            throttleTime(15), // 节流
            takeUntil(this.mouseUp)
          )
        ),
        // concatAll 顺序接受上游抛出的各个数据流作为它的数据， 若前面的数据流不能同步的完结，它会暂存后续数据流，当前数据流完成后它才会订阅后一个暂存的数据流
        concatAll(),
        withLatestFrom(this.mouseDown, (move: any, down: any) => {
          return {
            x: this.validValue(move.clientX - down.offsetX, window.innerWidth - this.title.nativeElement.offsetWidth, 0),
            y: this.validValue(move.clientY - down.offsetY, window.innerHeight - this.title.nativeElement.offsetHeight, 0)
          };
        })
      )
      .subscribe((position: any) => {
        this.position = {
          top: `${position.y}px`,
          left: `${position.x}px`
        };
      });
  }
  // 校验边界值
  public validValue = (value: number, max: number, min: number) => {
    return Math.min(Math.max(value, min), max);
  };
  /**
   * 打开组件
   *
   * @param mp 手机号码
   */
  open(mp: string) {
    this.phoneNumber = mp;
    this.visibled = true;
  }
  // 关闭
  close() {
    this.visibled = false;
    this.callholdSwitch = false;
    this.muteSwitch = false;
    this.phoneState = '电话呼出中';
  }
  // 接听
  accept() {
    this.callholdSwitch = true;
    this.muteSwitch = true;
    this.phoneState = '电话已接通';
  }
  //挂断
  hangUp($event: IEventEmitter | any) {
    this.hungUpEvent.emit({
      $event: $event,
      source: $event.target,
      data: {
        phoneNumber: this.phoneNumber
      }
    });
  }
  /**
   * 是否保持通话
   */
  callHolded = false;
  //通话保持
  callhold($event: IEventEmitter | any) {
    this.callHolded = !this.callHolded;
    this.callHoldEvent.emit({
      $event: $event,
      source: $event.target,
      data: {
        callHolded: this.callHolded,
        phoneNumber: this.phoneNumber
      }
    });
  }
  /**
   * 是否静音
   */
  muted = false;
  //静音
  mute($event: IEventEmitter | any) {
    this.muted = !this.muted;
    this.muteEvent.emit({
      $event: $event,
      source: $event.target,
      data: {
        muted: this.muted,
        phoneNumber: this.phoneNumber
      }
    });
  }
}

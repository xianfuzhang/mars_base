/**
 * Created by wls on 2018/6/26.
 */
export class easingService {
  static getDI() {
    return [

    ];
  }

  constructor(...args) {
    this.di = [];
    easingService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.pow = Math.pow;
    this.sqrt = Math.sqrt;
    this.sin = Math.sin;
    this.cos = Math.cos;
    this.PI = Math.PI;
    this.c1 = 1.70158;
    this.c2 = this.c1 * 1.525;
    this.c3 = this.c1 + 1;
    this.c4 = ( 2 * this.PI ) / 3;
    this.c5 = ( 2 * this.PI ) / 4.5;

  }

  bounceOut(x) {
    var n1 = 7.5625,
      d1 = 2.75;
    if ( x < 1/d1 ) {
      return n1*x*x;
    } else if ( x < 2/d1 ) {
      return n1*(x-=(1.5/d1))*x + .75;
    } else if ( x < 2.5/d1 ) {
      return n1*(x-=(2.25/d1))*x + .9375;
    } else {
      return n1*(x-=(2.625/d1))*x + .984375;
    }
  }

  easeInQuad(x) {
    return x * x;
  }

  easeOutQuad(x) {
    return 1 - ( 1 - x ) * ( 1 - x );
  }

  easeInOutQuad(x) {
    return x < 0.5 ?
      2 * x * x :
      1 - this.pow(-2 * x + 2, 2) / 2;
  }

  easeInCubic(x) {
    return x * x * x;
  }

  easeOutCubic(x) {
    return 1 - this.pow(1 - x, 3);
  }

  easeInOutCubic(x) {
    return x < 0.5 ?
      4 * x * x * x :
      1 - this.pow(-2 * x + 2, 3) / 2;
  }

  easeInQuart(x) {
    return x * x * x * x;
  }

  easeOutQuart(x) {
    return 1 - this.pow(1 - x, 4);
  }

  easeInOutQuart(x) {
    return x < 0.5 ?
      8 * x * x * x * x :
      1 - this.pow(-2 * x + 2, 4) / 2;
  }

  easeInQuint(x) {
    return x * x * x * x * x;
  }

  easeOutQuint(x) {
    return 1 - this.pow(1 - x, 5);
  }

  easeInOutQuint(x) {
    return x < 0.5 ?
      16 * x * x * x * x * x :
      1 - this.pow(-2 * x + 2, 5) / 2;
  }

  easeInSin(x) {
    return 1 - this.cos(x * this.PI / 2);
  }

  easeOutSine(x) {
    return this.sin(x * this.PI / 2);
  }

  easeInOutSine(x) {
    return -( this.cos(this.PI * x) - 1 ) / 2;
  }

  easeInExpo(x) {
    return x === 0 ? 0 : this.pow(2, 10 * x - 10);
  }

  easeOutExpo(x) {
    return x === 1 ? 1 : 1 - this.pow(2, -10 * x);
  }

  easeInOutExpo(x) {
    return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ?
      this.pow(2, 20 * x - 10) / 2 :
      ( 2 - this.pow(2, -20 * x + 10) ) / 2;
  }

  easeInCirc(x) {
    return 1 - this.sqrt(1 - this.pow(x, 2));
  }

  easeOutCirc(x) {
    return this.sqrt(1 - this.pow(x - 1, 2));
  }

  easeInOutCirc(x) {
    return x < 0.5 ?
      ( 1 - this.sqrt(1 - this.pow(2 * x, 2)) ) / 2 :
      ( this.sqrt(1 - this.pow(-2 * x + 2, 2)) + 1 ) / 2;
  }

  easeInElastic(x) {
    return x === 0 ? 0 : x === 1 ? 1 :
      -this.pow(2, 10 * x - 10) * this.sin(( x * 10 - 10.75 ) * this.c4);
  }

  easeOutElastic(x) {
    return x === 0 ? 0 : x === 1 ? 1 :
      this.pow(2, -10 * x) * this.sin(( x * 10 - 0.75 ) * this.c4) + 1;
  }

  easeInOutElastic(x) {
    return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ?
      -( this.pow(2, 20 * x - 10) * this.sin(( 20 * x - 11.125 ) * this.c5)) / 2 :
      this.pow(2, -20 * x + 10) * this.sin(( 20 * x - 11.125 ) * this.c5) / 2 + 1;
  }

  easeInBack(x) {
    return this.c3 * x * x * x - this.c1 * x * x;
  }

  easeOutBack(x) {
    return 1 + this.c3 * this.pow(x - 1, 3) + this.c1 * this.pow(x - 1, 2);
  }

  easeInOutBack(x) {
    return x < 0.5 ?
      ( this.pow(2 * x, 2) * ( ( this.c2 + 1 ) * 2 * x - this.c2 ) ) / 2 :
      ( this.pow(2 * x - 2, 2) * ( ( this.c2 + 1 ) * ( x * 2 - 2 ) + this.c2 ) + 2 ) / 2;
  }

  easeInBounce(x) {
    return 1 - this.bounceOut(1 - x);
  }

  easeOutBounce(x) {
    return this.bounceOut(x)
  }

  easeInOutBounce(x) {
    return x < 0.5 ?
      ( 1 - this.bounceOut(1 - 2 * x) ) / 2 :
      ( 1 + this.bounceOut(2 * x - 1) ) / 2;
  }

  static instance (...args) {
    return new easingService(args);
  }
}

easingService.instance.$inject = easingService.getDI();
easingService.$$ngIsClass = true;
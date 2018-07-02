export class metarow {
  static getDI() {
    return [
      'metarowService'
    ];
  }

  constructor(...args) {
    this.di = [];
    metarow.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.restrict = 'A';
    this.priority = -1;
    this.compile = () => {
      return {
        pre: this.di.metarowService.link
      }
    };
  }
}

metarow.$inject = metarow.getDI();
metarow.$$ngIsClass = true;

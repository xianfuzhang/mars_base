/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
export class modalStackedMap {
  static getDI () {
    return [
    ];
  }

  constructor (...args) {
    this.di = [];
    modalStackedMap.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.createNew = () => {
      let stack = [];

      return {
        add: (key, value) => {
          stack.push({
            key: key,
            value: value
          });
        },
        get: (key) => {
          let i;
          for (i = 0; i < stack.length; i += 1) {
            if (key === stack[i].key) {
              return stack[i];
            }
          }
        },
        keys: () => {
          let keys = [], i;
          for (i = 0; i < stack.length; i += 1) {
            keys.push(stack[i].key);
          }
          return keys;
        },
        top: () => {
          return stack[stack.length - 1];
        },
        remove: (key) => {
          let idx = -1;
          let i;
          for (i = 0; i < stack.length; i += 1) {
            if (key === stack[i].key) {
              idx = i;
              break;
            }
          }
          return stack.splice(idx, 1)[0];
        },
        removeTop: () => {
          return stack.splice(stack.length - 1, 1)[0];
        },
        length: () => {
          return stack.length;
        }
      };
    };
  }
}

modalStackedMap.$inject = modalStackedMap.getDI();
modalStackedMap.$$ngIsClass = true;

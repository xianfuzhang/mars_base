/**
 * Modal stack (multiple modals opened one above the other)
 */
export class modalStack {
  static getDI () {
    return [
      '$document',
      '$compile',
      '$rootScope',
      '$timeout',
      'modalStackedMap'
    ];
  }

  constructor (...args) {
    this.di = [];
    modalStack.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.backdropjqLiteEl;
    this.backdropDomEl;
    this.backdropScope = this.di.$rootScope.$new(+true);
    this.body = this.di.$document.find('body').eq(0);
    this.openedWindows = this.di.modalStackedMap.createNew();

    this.backdropIndex = () => {
      let topBackdropIndex = -1;
      let opened = this.openedWindows.keys();
      let i;
      for (i = 0; i < opened.length; i += 1) {
        if (this.openedWindows.get(opened[i]).value.backdrop) {
          topBackdropIndex = i;
        }
      }
      return topBackdropIndex;
    };

    this.di.$rootScope.$watch(this.backdropIndex, (newBackdropIndex) => {
      this.backdropScope.index = newBackdropIndex;
    });

    this.di.$document.bind('keydown', (evt) => {
      let modal;

      if (evt.which === 27) {
        modal = this.openedWindows.top();
        if (modal && modal.value.keyboard) {
          this.di.$rootScope.$apply(() => {
            this.dismiss(modal.key);
          });
        }
      }
    });

    this.open = (modalInstance, modal) => {
      this.openedWindows.add(modalInstance, {
        deferred: modal.deferred,
        modalScope: modal.scope,
        backdrop: modal.backdrop,
        keyboard: modal.keyboard
      });

      let angularDomEl = angular.element('<div modal-window hidden-x="hiddenX"></div>');
      let modalDomEl;
      angularDomEl.attr('window-class', modal.windowClass);
      angularDomEl.attr('index', this.openedWindows.length() - 1);
      angularDomEl.attr('top', modal.top);
      angularDomEl.attr('left', modal.left);
      angularDomEl.html(modal.content);

      modalDomEl = this.di.$compile(angularDomEl)(modal.scope);
      this.openedWindows.top().value.modalDomEl = modalDomEl;
      this.body.append(modalDomEl);

      if (this.backdropIndex() >= 0 && !this.backdropDomEl) {
        this.backdropjqLiteEl = angular.element('<div modal-backdrop></div>');
        this.backdropDomEl = this.di.$compile(this.backdropjqLiteEl)(this.backdropScope);
        this.body.append(this.backdropDomEl);
      }
    };

    this.close = (modalInstance, result) => {
      let modal = this.openedWindows.get(modalInstance);
      if (modal) {
        modal.value.deferred.resolve(result);
        this.removeModalWindow(modalInstance);
      }
    };

    this.dismiss = (modalInstance, reason) => {
      let modalWindow = this.openedWindows.get(modalInstance).value;
      if (modalWindow) {
        // if(reason.canceled != true) {
          modalWindow.deferred.resolve(reason);
        // }
        this.removeModalWindow(modalInstance);
      }
    };

    this.getTop = () => {
      return this.openedWindows.top();
    };

    this.getOpenedWindowsLength = () => {
      return this.openedWindows.length();
    };
  }

  removeModalWindow (modalInstance) {
    let modalWindow = this.openedWindows.get(modalInstance).value;


     modalWindow.modalDomEl.addClass('ease_out');
     this.backdropDomEl.addClass('fade');
    
    this.di.$timeout(() => {
      // clean up the stack
      this.openedWindows.remove(modalInstance);

      // remove window DOM element
      modalWindow.modalDomEl.remove();

      // remove backdrop if no longer needed
      if (this.backdropDomEl && this.backdropIndex() === -1) {
        this.backdropDomEl.remove();
        this.backdropDomEl = undefined;
      }

      // destroy scope
      modalWindow.modalScope.$destroy();
    }, 500);
  }
}

modalStack.$inject = modalStack.getDI();
modalStack.$$ngIsClass = true;

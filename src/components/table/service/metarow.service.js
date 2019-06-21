export class metarowService {
  static getDI() {
    return [
      'renderService',
      '$compile',
      '$templateCache',
      '_',
    ];
  }

  constructor(...args) {
    this.di = [];
    metarowService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
    this.T_CELL = 'td';
    this.compileCache = {};
    this.service = {};

    this.getSpec = ($scope, col) => {
      let value = $scope.$data[col.field];
      if (col.field.indexOf('.') > 0) {
        let props = col.field.split('.');
        // NOTE: supporting only 2 levels for now, not recursive
        value = $scope.$data[props[0]][props[1]];
      }

      return {
        object: $scope.$data,
        value: value,
        col_title: $scope.$data[col.field + '_title'],
        params: col.render.params,
        col: col,
        getContext: $scope //col.render.getContext
      };
    };

    this.renderColumn = ($scope, $elem, $attrs, col, colElement) => {
      this.di._.noop($elem, $attrs);
      let render = col.render.spec;
      let type = render ? render.getType() : '';
      let content; let scope; let renderVal; let spec = this.getSpec($scope, col);
      let classes; let clazz; let i; let len;

      if (!col.visible || col.hidden) {
        colElement.classList.add("mdl-table-body__td__hide");
      }
      colElement.title = !spec.value ? '-' : spec.value;
      // CACHE: Do not redraw if new value is identical with previous value
      if (spec.value && colElement._renderedValue === spec.value) {
        return;
      }

      colElement._renderedValue = spec.value;
      switch (type) {
        case this.di.renderService.render().CONST_TYPE_TEXT:
          colElement.innerHTML = this.di._.escape(render.render(spec));
          break;
        case this.di.renderService.render().CONST_TYPE_HTML:
          colElement.innerHTML = render.render(spec);
          break;
        case this.di.renderService.render().CONST_TYPE_DOM:
          spec.element = colElement;
          render.render(spec);
          break;
        case this.di.renderService.render().CONST_TYPE_INCLUDE:
          renderVal = render.render();

          if (renderVal && renderVal.url) {
            content = this.compileCache[renderVal.url];
            if (!content) {
              content = this.di.$templateCache.get(renderVal.url).trim();
              // cache compile function
              this.compileCache[renderVal.url] = content;
            }

            content = this.di.$compile(content);

            scope = $scope.$new();
            // expose column
            scope.$col = col;
            scope.$field = col.field;
            $scope.$params = col.render.params;

            content = content(scope);
            angular.element(colElement).append(content);
            colElement.setAttribute('data-ng', 'true');
          }
          break;
      }

      if (render.getClasses) {
        // additional classes for this cell
        classes = render.getClasses(spec);
        if (classes) {
          if (angular.isString(classes)) {
            classes = classes.split(/\s/);
          } else if (!angular.isArray(classes)) {
            classes = null;
          }
          if (classes) {
            if (render.cleanClasses) {
              render.cleanClasses(colElement);
            }
            for (i = 0, len = classes.length; i < len; i += 1) {
              clazz = classes[i];
              if (clazz && clazz.trim) {
                clazz = clazz.trim();
                if (clazz.length) {
                  colElement.classList.add(classes[i]);
                }
              }
            }
          }
        }
      }

      return colElement;
    };

    this.update = ($scope, $elem, $attrs) => {
      let i; let len; let col; let fragment;
      let colElement; let nodes = $elem[0].children;

      let count = $elem[0].childElementCount;
      let j = 0;
      if ($scope.tableModel.rowCheckboxSupport) {
        count = count - 1;
        j +=1;
      }
      if ($scope.tableModel.rowActionsSupport) {
        count = count - 1;
        j +=1;
      }
      // row was previously drawn? just UPDATE TD's
      if (count) {
        for (i = 0, len = $scope.tableModel.columns.length; i < len; i += 1) {
          col = $scope.tableModel.columns[i];
          //if (col.visible && !col.hidden) {
          colElement = nodes[i + j];
          this.renderColumn($scope, $elem, $attrs, col, colElement);
          //}
        }
      }
      else { // empty row? CREATE TD's
        // $log.debug('[table] metarowService - creating new row');
        fragment = document.createDocumentFragment();
        for (i = 0, len = $scope.tableModel.columns.length; i < len; i += 1) {
          col = $scope.tableModel.columns[i];
          //if (col.visible && !col.hidden) {
          colElement = document.createElement(this.T_CELL);
          this.renderColumn($scope, $elem, $attrs, col, colElement);
          fragment.appendChild(colElement);
         // }
        }
        $elem[0].appendChild(fragment);
      }
    };

    this.cleanup = ($scope, $elem) => {
      this.di._.noop($scope, $elem);
    };

    this.updateColumns = ($scope, $elem, $attrs, oldCols, newCols) => {
      let i; let len; let elem = null; let o; let n;
      let col;
      let columnNodes = $elem[0].children;

      let j=0;
      if ($scope.tableModel.rowCheckboxSupport) {
       j += 1;
      }
      if ($scope.tableModel.rowActionsSupport) {
        j += 1;
      }
      for (i = 0, len = oldCols.length; i < len; i += 1) {
        o = oldCols[i];
        n = newCols[i];
        if (oldCols[i] !== newCols[i]) {
          if (o && !n) {
            // hide this column
            let hideNode = columnNodes[i+j];
            hideNode.classList.add('mdl-table-body__td__hide');
            //$elem[0].removeChild(toRemove);
            /*if (!elem) {
              toRemove = $elem[0].firstChild;
            } else {
              // remove right sibling
              toRemove = elem.nextSibling;
            }
            if (toRemove.getAttribute('data-ng')) {
              // clear included data
              angularElem = angular.element(toRemove.firstChild);
              if (angularElem.scope) {
                angularElem.scope().$destroy();
              }
            }*/
          }
          else if (!o && n) {
            // show this column
            let showNode = columnNodes[i+j];
            showNode.classList.remove('mdl-table-body__td__hide');
           /* let colElement = document.createElement('td');
            col = $scope.tableModel.columns[i];
            if (col.render) {
              this.renderColumn($scope, $elem, $attrs, col, colElement);
            }

            if (!elem) {
              // need to add this
              elem = colElement;
              if ($elem[0].firstChild) {
                // appear before existing col
                $elem[0].insertBefore(elem, $elem[0].firstChild);
              } else {
                // just me
                $elem[0].appendChild(elem);
              }
            } else {
              // add next sibling
              if (elem.nextSibling) {
                $elem[0].insertBefore(colElement, elem.nextSibling);
              } else {
                $elem[0].appendChild(colElement);
              }

              // current element
              elem = colElement;
            }*/
          }
        }
        /*else if (oldCols[i]) {
          elem = elem ? elem.nextSibling : $elem[0].firstChild;
        }*/
      }
    };
  }

  link ($scope, $elem, $attrs) {
    let idCols = $scope.tableModel.listeners.addEventListener(
      'table.columns.visibility',
      ($event, $data) => {
        this.di.metarowService.di._.noop($event);
        this.di.metarowService.updateColumns($scope, $elem, $attrs, $data.oldCols, $data.newCols);
      }
    );
    let idUpdate = $scope.tableModel.listeners.addEventListener(
      'table.update',
      ($event, $data) => {
        this.di.metarowService.cleanup($scope, $elem, $data);
        this.di.metarowService.update($scope, $elem, $data);
      }
    );

    // cleanup
    $scope.$on('$destroy', () => {
      $scope.tableModel.listeners.removeEventListener(
        'table.columns.visibility',
        idCols
      );
      $scope.tableModel.listeners.removeEventListener(
        'table.update',
        idUpdate
      );
    });
  }
}

metarowService.$inject = metarowService.getDI();
metarowService.$$ngIsClass = true;

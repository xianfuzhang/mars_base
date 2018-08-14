import './scss/table.scss'

import {TableController} from './ng/table.controller';
import {showHideColumnCtrl} from './ng/showHideColumn.controller';
import {mdlTable} from './ng/table.directive';
import {TableAction} from './ng/tableActions.directive';
import {tableProvider} from './service/tableProvider';
import {tableProviderFactory} from './service/tableProviderFactory';
import {fastListenerService} from './service/fastListener.service';
import {metarow} from './ng/metarow.directive';
import {metarowService} from './service/metarow.service';
import {renderService} from './service/render.service';
import {genericFactoryRegistry} from './service/genericFactoryRegistry';
import {genericFactoryRegistryService} from './service/genericFactoryRegistry.service';
import {textRenderer} from './service/renderers/textRenderer';
import {textRendererFactory} from './service/renderers/textRendererFactory';
import {ClickableTextRenderer} from './service/renderers/clickableTextRenderer';
import {ClickableTextRendererFactory} from './service/renderers/clickableTextRendererFactory';
import {iconRenderer} from './service/renderers/iconRenderer';
import {tableConsts} from './service/table.consts';

import {rowCheckbox} from './ng/rowCheckbox.directive';
import {rowActions} from './ng/rowActions.directive';
import {tablePagination} from './ng/pagination.directive';

export default angular
  .module('mdlTable', [])
  .controller('TableController', TableController)
  .controller('showHideColumnCtrl', showHideColumnCtrl)
  .directive('mdlTable', mdlTable)
  .directive('tableAction', TableAction)
  .directive('metarow', metarow)
  .directive('rowCheckbox', rowCheckbox)
  .directive('rowActions', rowActions)
  .directive('tablePagination', tablePagination)
  .service('tableProvider', tableProvider)
  .service('tableProviderFactory', tableProviderFactory)
  .service('fastListenerService', fastListenerService)
  .service('metarowService', metarowService)
  .service('renderService', renderService)
  .service('genericFactoryRegistry', genericFactoryRegistry)
  .service('genericFactoryRegistryService', genericFactoryRegistryService)
  .service('tableConsts', tableConsts)
  .service('textRenderer', textRenderer)
  .service('textRendererFactory', textRendererFactory)
  .service('clickableTextRenderer', ClickableTextRenderer)
  .service('clickableTextRendererFactory', ClickableTextRendererFactory)
  .service('iconRendererFactory', iconRenderer)
  .name;
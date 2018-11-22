import './component/segment_establish/scss/segment_establish.scss';

import {TenantController} from './ng/tenant.controller';
import {TenantEstablishController} from './component/tenant_establish/ng/tenantEstablish.controller';
import {SegmentController} from './ng/segment.controller';
import {SegmentEstablishController} from './component/segment_establish/ng/segmentEstablish.controller';

export default angular
  .module('logical', [])
  .controller('TenantController', TenantController)
  .controller('TenantEstablishController', TenantEstablishController)
  .controller('segmentController', SegmentController)
  .controller('segmentEstablishController', SegmentEstablishController)
  .name;



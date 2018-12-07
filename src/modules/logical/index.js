// import './scss/tenant.scss';
// import './component/segment_establish/scss/segment_establish.scss';
// import './component/segmentmember_establish/scss/segmentmember_establish';

import {TenantController} from './ng/tenant.controller';
import {SegmentDetailController} from './ng/segmentDetail.controller';
import {TenantEstablishController} from './component/tenant_establish/ng/tenantEstablish.controller';
import {TenantDetail} from './ng/tenantDetail.controller';
import {SegmentController} from './ng/segment.controller';
import {SegmentEstablishController} from './component/segment_establish/ng/SegmentEstablish.controller';
import {SegmentMemberEstablishController} from './component/segmentmember_establish/ng/segmentMemberEstablish.controller';

export default angular
  .module('logical', [])
  .controller('TenantController', TenantController)
  .controller('SegmentDetailController', SegmentDetailController)
  .controller('TenantEstablishController', TenantEstablishController)
  .controller('tenantDetailCtrl', TenantDetail)
  .controller('segmentController', SegmentController)
  .controller('segmentEstablishController', SegmentEstablishController)
  .controller('SegmentMemberEstablishController', SegmentMemberEstablishController)
  .name;

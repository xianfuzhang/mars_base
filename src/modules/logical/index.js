import './component/segmentmember_establish/scss/segmentmember_establish';

import {TenantController} from './ng/tenant.controller';
import {TenantEstablishController} from './component/tenant_establish/ng/tenantEstablish.controller';
import {SegmentMemberEstablishController} from './component/segmentmember_establish/ng/segmentMemberEstablish.controller';

export default angular
  .module('logical', [])
  .controller('TenantController', TenantController)
  .controller('TenantEstablishController', TenantEstablishController)
  .controller('SegmentMemberEstablishController', SegmentMemberEstablishController)
  .name;

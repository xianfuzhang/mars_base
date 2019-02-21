// import './scss/tenant.scss';
// import './component/segment_establish/scss/segment_establish.scss';
// import './component/segmentmember_establish/scss/segmentmember_establish';

import {TenantController} from './ng/tenant.controller';
import {SegmentDetailController} from './ng/segmentDetail.controller';
import {TenantEstablishController} from './component/tenant_establish/ng/tenantEstablish.controller';
import {TenantDetail} from './ng/tenantDetail.controller';
import {SegmentController} from './ng/segment.controller';
import {QoSController} from './ng/qos.controller';
import {EGPController} from './ng/egp.controller';
import {SegmentEstablishController} from './component/segment_establish/ng/SegmentEstablish.controller';
import {SegmentMemberEstablishController} from './component/segmentmember_establish/ng/segmentMemberEstablish.controller';
import {CosEstablishController} from './component/cos_establish/ng/cosEstablish.controller';
import {EcnEstablishController} from './component/ecn_establish/ng/ecnEstablish.controller';
import {EGPGroupEstablishController} from './component/epg_establish/ng/group.controller';
import {EGPPolicyEstablishController} from './component/epg_establish/ng/policy.controller';
import {RouteEstablishController} from './component/route_establish/ng/routeEstablish.controller';
import {StaticRouteEstablishController} from './component/staticroute_establish/ng/staticrouteEstablish.controller';
import {NexthopEstablishController} from './component/nexthop_establish/ng/nexthopEstablish.controller';

export default angular
  .module('logical', [])
  .controller('TenantController', TenantController)
  .controller('SegmentDetailController', SegmentDetailController)
  .controller('TenantEstablishController', TenantEstablishController)
  .controller('tenantDetailCtrl', TenantDetail)
  .controller('segmentController', SegmentController)
  .controller('qosCtrl', QoSController)
  .controller('egpCtrl', EGPController)
  .controller('segmentEstablishController', SegmentEstablishController)
  .controller('SegmentMemberEstablishController', SegmentMemberEstablishController)
  .controller('cosEstablishCtrl', CosEstablishController)
  .controller('ecnEstablishCtrl', EcnEstablishController)
  .controller('epgGroupEstablishCtrl', EGPGroupEstablishController)
  .controller('egpPolicyEstablishCtrl', EGPPolicyEstablishController)
  .controller('routeEstablishController', RouteEstablishController)
  .controller('staticRouteEstablishController', StaticRouteEstablishController)
  .controller('nexthopEstablishController', NexthopEstablishController)
  .name;

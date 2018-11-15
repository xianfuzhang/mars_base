import {TenantController} from './ng/tenant.controller';
import {TenantEstablishController} from './component/tenant_establish/ng/tenantEstablish.controller';

export default angular
  .module('logical', [])
  .controller('TenantController', TenantController)
  .controller('TenantEstablishController', TenantEstablishController)
  .name;



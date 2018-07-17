/**
 * Created by wls on 2018/6/26.
 */
import { localStoreService } from './ng/localStore.service';


export default angular
  .module('localStore', [])
  .service('localStoreService', localStoreService)
  .name;

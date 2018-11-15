import { EventEmitterService } from './ng/eventEmitter.service';

export default angular
    .module('eventEmitter', [])
    .factory('eventEmitter', [ EventEmitterService.factory ]);

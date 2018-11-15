export class EventEmitterService {
    static factory () {
        let ee = require('./EventEmitter');
        return ee;
    }
}


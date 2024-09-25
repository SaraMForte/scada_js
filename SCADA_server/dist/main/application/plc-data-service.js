"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PlcDataService {
    constructor(moduleRepository) {
        this.moduleRepository = moduleRepository;
    }
    readValue(property) {
        return this.moduleRepository.readValue(property);
    }
    readValues() {
        return this.moduleRepository.readValues();
    }
    writeValue(property, value) {
        return this.moduleRepository.writeValue(property, value);
    }
    writeValues(valuesMap) {
        return this.moduleRepository.writeValues(valuesMap);
    }
}
exports.default = PlcDataService;
//# sourceMappingURL=plc-data-service.js.map
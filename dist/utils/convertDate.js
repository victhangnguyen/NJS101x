"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDateVNtoUS = void 0;
const convertDateVNtoUS = (date) => {
    const [day, month, year] = date.split('/');
    const newDate = [month, day, year].join('/');
    return newDate;
};
exports.convertDateVNtoUS = convertDateVNtoUS;
//# sourceMappingURL=convertDate.js.map
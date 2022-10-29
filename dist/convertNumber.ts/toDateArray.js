"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const convertDate_1 = require("./convertDate");
const toDateArray = (dates, multidateSeparator = ',') => {
    const dateArray = dates.split(multidateSeparator).map((date) => new Date((0, convertDate_1.convertDateVNtoUS)(date)));
    return dateArray;
};
exports.default = toDateArray;
//# sourceMappingURL=toDateArray.js.map
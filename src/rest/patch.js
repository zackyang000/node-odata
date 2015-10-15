"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = function (req, MongooseModel) {
    return new Promise(function (resolve, reject) {
        if (!Object.keys(req.body).length) {
            return reject({ status: 422 });
        }
        MongooseModel.findOneAndUpdate({ _id: req.params.id },req.body,{"new":true},function(err,entity){
            if (err) {
                return reject(err);
            }
            return resolve({ status: 201, entity: entity });
        });
    });
};

module.exports = exports["default"];
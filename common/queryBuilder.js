var util = require('util');
var apiModelMap = require('../models/api_model_map.js');

var Builder = function(options) {
  if(!options.model) {
    throw new Error('no model is defined in options');
  }
  util._extend(this, options);

  //Query create function
  Builder.prototype.one = function(id) {
    this.query = this.model.findById(id);
    this.afterQuery(this.query);
    return this;
  };

  Builder.prototype.list = function(searchSpec) {
    if (searchSpec.extended_fetch) {
      this.query = this.model.find({});
      this.afterQuery(this.query, searchSpec);
    }
    else {
      var fields = {};
      fields[searchSpec.link_display_field] = 1;
      this.query = this.model.find({}, fields);
      this.afterQuery(this.query, searchSpec);
    }
    this.query.limit(searchSpec.limit);

    return this;
  };

  //Query exec
  Builder.prototype.exec = function(callback) {
    var self = this;
    if(this.query) {
      this.query.exec(function(err, data) {
        if (Array.isArray(data)) {
          var newData = [];
          for(var i in data) {
            newData.push(fieldResolver(data[i]));
          }
          data = newData;
        }
        else {
          data = fieldResolver(data);
        }

        data = self.afterExec(data);

        callback.call(self, err, data);
      });
    }
    else {
      throw new Error('query is undefined');
    }
  };

  Builder.prototype.createNew = function(object) {
    return new this.model(object);
  };

  Builder.prototype.afterQuery = function(query, multiple) {};
  Builder.prototype.afterExec = function(data) {
    return data;
  };

  Builder.prototype.getModelFields = function(model) {
    var dbModel = model || this.model;
    var fields = [];
    for(var key in dbModel.schema.paths) {
      if(key !== '_id' && key !== '__v') {
        fields.push(key);
      }
    }
    return fields;
  };

  var fieldResolver = function(modelData) {
    var newData = {};
    var fields = modelData.schema.paths;
    var uri = apiModelMap[modelData.constructor.modelName];
    for(var key in fields) {
      var value = modelData[key];
      if(key === '__v' || value === undefined) {

      }
      else if(key === '_id' && value.constructor.name === 'ObjectID' && uri) {
        newData.uri = uri + '/' + value.toString();
      }
      else if(value.constructor.name === 'model') {
        newData[key] = fieldResolver(value);
      }
      else {
        newData[key] = value;
      }
    }

    return newData;
  };
};




module.exports = Builder;


var util = require('util');
var apiModelMap = require('../api/api_model_map.js');

function MongooseQueryBuilder (options) {
  if(!options.model) {
    throw new Error('no model is defined in options');
  }
  util._extend(this, options);

  //Query create function
  MongooseQueryBuilder.prototype.one = function(id) {
    this.query = this.model.findById(id);
    this.afterQuery(this.query);
    return this;
  };

  MongooseQueryBuilder.prototype.list = function(searchSpec) {
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
  MongooseQueryBuilder.prototype.exec = function(callback) {
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

  MongooseQueryBuilder.prototype.createNew = function(object) {
    return new this.model(object);
  };

  MongooseQueryBuilder.prototype.afterQuery = function(query, multiple) {};
  MongooseQueryBuilder.prototype.afterExec = function(data) {
    return data;
  };

  MongooseQueryBuilder.prototype.getModelFields = function(model) {
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
        //ignore certain fields
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




module.exports = MongooseQueryBuilder;


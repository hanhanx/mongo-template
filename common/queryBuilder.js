var util = require('util');

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
      this.afterQuery(this.query);
    }
    else {
      var fields = {};
      fields[searchSpec.link_display_field] = 1;
      this.query = this.model.find({}, fields);
      this.afterQuery(this.query);
    }
    this.query.limit(searchSpec.limit);

    return this;
  };

  //Query exec
  Builder.prototype.exec = function(callback) {
    var self = this;
    if(this.query) {
      this.query.exec(function(err, data) {
        if(Array.isArray(data)) {
          var newData = [];
          for(var i in data) {
            newData.push(data[i].toObject());
          }
          data = newData;
        }
        else {
          data = data.toObject();
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
  }


  Builder.prototype.afterQuery = function(query) {};
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
};


module.exports = Builder;


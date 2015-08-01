var util = require('util');
var express = require('express');
var router = express.Router();
var QueryBuilder = require('../common/QueryBuilder.js');

module.exports = function(qb, uri, extAPI, description) {

  if(!qb) {
    return new Error('Query Builder is undefined');
  }
  if(!uri) {
    return new Error('uri is undefined');
  }


  var getOptions = function(default_link_display_field) {
    var options = {
      hide_option_field: {
        type: 'boolean',
        description: 'hide fields and options in the return response',
        default: 0
      },
      limit: {
        type: 'int',
        description: 'number of records to retrieve',
        default: 100
      },
      offset: {
        type: 'int',
        description: 'the starting index of the first record',
        default: 0
      },
      extended_fetch: {
        type: 'boolean',
        description: 'fetch the sub resources',
        default: 0
      },
      link_display_field: {
        type: 'string',
        description: 'return the field for the value in description',
        default: default_link_display_field
      }

    }
    return options;
  };

  var parseQueryParams = function(query, options) {
    var searchSpec = {
      link_display_field: options.link_display_field.default,
      limit: options.limit.default,
      offset: options.offset.default,
      extended_fetch: options.extended_fetch.default,
      hide_option_field: options.hide_option_field.default
    };

    for(var key in query) {
      var qValue = query[key];
      if(options[key] && qValue) {
        var type = options[key].type;
        if(type === 'int' || type === 'boolean') {
          qValue = parseInt(qValue);
          if(!isNaN(qValue)) {
            searchSpec[key] = qValue;
          }
        }
        else {
          searchSpec[key] = qValue;
        }
      }
    };
    return searchSpec;
  };


  var processResultSet = function(searchSpec, data, fields) {
    var resultSet = [];

    for(var i in data) {
      var d = data[i];
      var o = {URI: searchSpec.baseUri + '/' + d._id};


      if(searchSpec.extended_fetch) {
        for(var f in fields) {
          o[fields[f]] = d[fields[f]];
        }
      }
      else {
        o.description = d[searchSpec.link_display_field];
      }

      resultSet.push(o);
    };

    return resultSet;
  };

  var decorateFields = function(row) {
    var newRow = {};
    for(var key in row) {

    }
    return newRow;
  };



  var api = {
    list: function(req, res) {

      //var routeURI = req.baseUrl + req.path;

      var fields = qb.getModelFields();
      var options = getOptions(fields[0]);
      var result = {
        fields: fields,
        options: options,
        result_set: []
      };

      var searchSpec = parseQueryParams(req.query, options);
      //searchSpec.baseUri = routeURI;

      qb.list(searchSpec).exec(function(err, data) { //need to abstract and chainable of this method

        if(err) {
          res.status(500).json(err);
        }
        else {
          var result = {};
          if(!searchSpec.hide_option_field) {
            result.fields = fields;
            result.options = options;
          }
          result.result_set = data;//processResultSet(searchSpec, data, fields);

          res.status(200).json(result);
        }
      });
    },
    one: function(req, res) {
      var id = req.params.id;
      qb.one(id).exec(function(err, one) { //need to abstract and chainable of this method
        if(err) {
          res.status(404).json(err);
        }
        else {
          //var fields = qb.getModelFields();
          //var result = {};
          //for(var f in fields) {
          //  result[fields[f]] = one[fields[f]];
          //}
          var row = stripField(one);
          res.status(200).json(row);
        }
      });
    },

    add: function(req, res) {
      if(req.body === undefined || Object.keys(req.body).length === 0) {
        var error = 'request body is undefined';
        res.status(500).json({message:error});
      }
      else {
        var model = qb.createNew(req.body);
        model.save(function(err, data, numberAffected) {
          if(!err) {
            res.status(201).json(data);
          }
          else {
            res.status(500).json(err);
          }
        });
      }
      
    },
    edit: function(req, res) {
      res.sendStatus(404);
    },
    delete: function(req, res) {
      var id = req.params.id;
      qb.one(id).exec(function(err, data) {
        return data.remove(function(err) {
          if(!err) {
            res.status(204).send();
          }
          else {
            res.status(500).json(err);
          }
        })
      });
    },
    before: function() {
      console.log('before');
    },
    after: function() {
      console.log('after');

    }
  };



  extAPI = util._extend(api, extAPI);

  router.get(uri, extAPI.list);
  router.post(uri, extAPI.add);
  router.route(uri + '/:id')
    .get(extAPI.one)
    .put(extAPI.edit)
    .delete(extAPI.delete);


  return {
    router: router,
    uri: uri,
    description: description
  };
}
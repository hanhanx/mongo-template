var util = require('util');
var express = require('express');
var router = express.Router();

module.exports = function(MongoModel, uri, extAPI, description) {

  if(!MongoModel) {
    return new Error('MongoModel is undefined');
  }
  if(!uri) {
    return new Error('uri is undefined');
  }

  var api = {
    list: function(req, res) {
      console.log("----------------------------base");
      MongoModel.find(function(err, result) {
        if(err) {
          res.status(500).json(err);
        }
        else {

          res.status(200).json(result);
        }
      });
    },
    one: function(req, res) {
      var id = req.params.id;
      MongoModel.findOne({'_id':id}, function(err, one) {
        if(err) {
          res.status(404).json(err);
        }
        else {
          res.status(200).json(one);
        }
      });
    },
    validateAdd: function(req, res) {
      if(req.body === undefined || Object.keys(req.body).length === 0) {
        res.status(500).json({message:'request body is undefined'});
        return false;
      }
      return true;

    },
    add: function(req, res) {
      if(!api.validateAdd(req, res)) {
        return res;
      }

      var model = new MongoModel(req.body);
      model.save(function(err, data, numberAffected) {
        if(!err) {
          return res.status(201).json(data);
        }
        else {
          console.log(err);
          return res.status(500).json(err);
        }
      });
    },
    edit: function(req, res) {
      res.sendStatus(404);
    },
    delete: function(req, res) {
      var id = req.params.id;
      MongoModel.findById(id, function(err, data) {
        return data.remove(function(err) {
          if(!err) {
            return res.status(204).send();
          }
          else {
            return res.status(500).json(err);
          }
        })
      });
    }
  }

  extAPI = util._extend(api, extAPI);


  router.uri = uri;
  router.description = description;
  router.get(uri, extAPI.list);
  router.post(uri, extAPI.add);
  router.route(uri + '/:id')
    .get(extAPI.one)
    .put(extAPI.edit)
    .delete(extAPI.delete);

  return router;
}
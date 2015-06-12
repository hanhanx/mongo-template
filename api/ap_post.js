// Module dependencies.
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.models.Post;
var api = {};

router.uri = '/post';
router.description = 'template post';

// ALL
api.posts = function (req, res) {
  console.log("-------------------------------post");
  Post.find(function(err, posts) {
    if (err) {
      res.status(500).json(err);
    } else {
      res.status(200).json(posts);
    }
  });
};

// GET
api.post = function (req, res) {
  var id = req.params.id;
  Post.findOne({ '_id': id }, function(err, post) {
    if (err) {
      res.status(404).json(err);
    } else {
      res.status(200).json(post);
    }
  });
};

// POST
api.addPost = function (req, res) {

  var post;

  if(typeof req.body == 'undefined'){
    return res.status(500).json({message: 'post is undefined'});
  }

  post = new Post(req.body);

  post.save(function (err) {
    if (!err) {
      console.log("created post");
      return res.status(201).json(post.toObject());
    } else {
       return res.status(500).json(err);
    }
  });

};

// PUT
api.editPost = function (req, res) {
  var id = req.params.id;

  Post.findById(id, function (err, post) {



    if(typeof req.body.post["title"] != 'undefined'){
      post["title"] = req.body.post["title"];
    }

    if(typeof req.body.post["excerpt"] != 'undefined'){
      post["excerpt"] = req.body.post["excerpt"];
    }

    if(typeof req.body.post["content"] != 'undefined'){
      post["content"] = req.body.post["content"];
    }

    if(typeof req.body.post["active"] != 'undefined'){
      post["active"] = req.body.post["active"];
    }

    if(typeof req.body.post["created"] != 'undefined'){
      post["created"] = req.body.post["created"];
    }


    return post.save(function (err) {
      if (!err) {
        console.log("updated post");
        return res.status(200).json(post.toObject());
      } else {
       return res.status(500).json(err);
      }
      return res.status(200).json(post);
    });
  });

};

// DELETE
api.deletePost = function (req, res) {
  var id = req.params.id;
  Post.findById(id, function (err, post) {
    return post.remove(function (err) {
      if (!err) {
        console.log("removed post");
        return res.status(204).send();
      } else {
        console.log(err);
        return res.status(500).json(err);
      }
    });
  });

};


router.get(router.uri, api.posts);
router.post(router.uri, api.addPost);

router.route(router.uri + '/:id')
  .get(api.post)
  .put(api.editPost)
  .delete(api.deletePost);

module.exports = router;

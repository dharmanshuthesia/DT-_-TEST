package com.demo.socialmedia.controller;

import com.demo.socialmedia.service.SocialMediaService;
import com.demo.socialmedia.model.Post;
import com.demo.socialmedia.model.Comment;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST entry point for the social media API. Exposes CRUD endpoints for posts,
 * comments and reactions under the "/api" base path and delegates all business
 * logic to {@link SocialMediaService}.
 */
@RestController
@RequestMapping(path="/api")
public class SocialMediaController {

    // Business-logic collaborator; all endpoints below are thin pass-throughs to this service.
    private SocialMediaService socialMediaService;

    @Autowired
    public void setSocialMediaService(SocialMediaService socialMediaService) {
        // Setter injection: Spring wires the singleton service instance after construction.
        this.socialMediaService = socialMediaService;
    }

    // GET /api/helloworld -> plain-text liveness check, no auth or DB access
    @GetMapping("/helloworld")
    public String helloWorld() {
        // Trivial health/smoke-test endpoint used to confirm the API is reachable.
        return "Hello world";
    }

     //return all of a users posts
    @GetMapping("/posts")
    public List<Post> getAllPosts() {
        System.out.println("getting getPosts"); // console trace for local debugging
        return socialMediaService.getAllPosts();
    }

    // get a single post
    @GetMapping("/posts/{postId}")
    public Post getSinglePost(@PathVariable Long postId) {
        System.out.println("calling getPost");
        // postId comes from the URL path; service throws if no such post exists
        return socialMediaService.getSinglePost(postId) ;
    }

    // create a new post
    @PostMapping("/posts")
    public Post createSinglePost(@RequestBody Post postObject) {
        System.out.println("calling createPost");
        // request JSON body is deserialized into a Post; service stamps owner + timestamps
        return socialMediaService.createSinglePost(postObject);
    }

    // update a post
    @PutMapping("/posts/{postId}")
    public Post updateSinglePost(@PathVariable Long postId, @RequestBody Post postObject) {
        System.out.println("calling updateSinglePost");
        // full replace of the post identified by postId with the supplied body
        return socialMediaService.updateSinglePost(postId, postObject);
    }

    // delete a post
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deleteSinglePost(@PathVariable Long postId) {
        System.out.println("calling deletePost");
        // returns a ResponseEntity so the service can signal 200/404 status directly
        return socialMediaService.deleteSinglePost(postId);
    }

    // delete all post
    @DeleteMapping("/posts")
    public ResponseEntity<?> deleteAllPosts() {
        System.out.println("calling deleteAllPosts");
        // bulk wipe of the caller's posts; irreversible
        return socialMediaService.deleteAllPosts();
    }

    // make a comment on a post
    @PostMapping("/posts/{postId}/comments")
    public Comment commentOnPost(@PathVariable Long postId, @RequestBody Comment comment) {
        System.out.println("calling commentOnPost");
        // attaches the new comment to the parent post identified by postId
        return socialMediaService.commentOnPost(postId, comment);
    }

    // get all comments on a post
    @GetMapping("/posts/{postId}/comments")
    public List<Comment> getAllCommentsOnPost(@PathVariable Long postId) {
        System.out.println("calling getAllCommentsOnPost");
        // returns comments in the order the service/repository yields them
        return socialMediaService.getAllCommentsOnPost(postId);
    }

    // edit a comment on a post
    /** Return to method below if we need to reimplement the post id in SERVICE
     * @editCommentOnPost
     */
    @PutMapping("/posts/{postId}/comments/{commentId}")
    public Comment editCommentOnPost(@PathVariable Long commentId, @RequestBody Comment comment) {
        System.out.println("calling editCommentOnPost");
        // postId in the path is currently ignored; comment is looked up by commentId alone
        return socialMediaService.editCommentOnPost(commentId, comment);
    }

    // delete a comment on a post
    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<?> deleteCommentOnPost(@PathVariable Long postId, @PathVariable Long commentId) {
        System.out.println("calling deleteCommentOnPost");
        // service verifies the comment belongs to postId before removing it
        return socialMediaService.deleteCommentOnPost(postId, commentId);
    }

    // delete all comments on a post
    @DeleteMapping("/posts/{postId}/comments")
    public ResponseEntity<?> deleteAllCommentsOnPost(@PathVariable Long postId) {
        System.out.println("calling deleteAllCommentsOnPost");
        // clears every comment under the given post
        return socialMediaService.deleteAllCommentsOnPost(postId);
    }

    // add a reaction (like, love, etc.) to a post
    @PostMapping("/posts/{postId}/reactions/{reaction}")
    public Post postReactions(@PathVariable String reaction, @PathVariable Long postId){
        System.out.println("Calling postReaction");
        // reaction is a free-form string (e.g. "like"); service enforces one reaction per user
        return socialMediaService.postReactions(reaction, postId);
    }
}


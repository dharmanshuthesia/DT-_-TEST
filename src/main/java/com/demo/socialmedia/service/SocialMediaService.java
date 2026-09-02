package com.demo.socialmedia.service;

import com.demo.socialmedia.model.ReactionsCount;
import com.demo.socialmedia.exception.InformationExistException;
import com.demo.socialmedia.exception.InformationNotFoundException;
import com.demo.socialmedia.exception.ReactionInvalidException;
import com.demo.socialmedia.model.Reactions;
import com.demo.socialmedia.model.Post;
import com.demo.socialmedia.model.Comment;
import com.demo.socialmedia.repository.CommentRepository;
import com.demo.socialmedia.repository.PostRepository;
import com.demo.socialmedia.repository.ReactionsCountRepository;
import com.demo.socialmedia.repository.ReactionsRepository;
import com.demo.socialmedia.security.MyUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SocialMediaService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ReactionsCountRepository reactionsCountRepository;

    @Autowired
    private ReactionsRepository reactionsRepository;

    @Autowired
    public void setSocialMediaRepository(PostRepository postRepository) {
        this.postRepository = postRepository;
    }



    // return every post in the system, regardless of author (public timeline)
    public List<Post> getAllPosts() {
        System.out.println("service calling getAllPosts ==>");
        return postRepository.findAll();
    }

    // fetch one post, but only if it belongs to the currently logged-in user
    public Post getSinglePost(Long postId) {
        System.out.println("service getSinglePost ==>");
        // pull the authenticated principal out of the Spring Security context
        MyUserDetails userDetails = (MyUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        // scope the lookup to (postId, currentUserId) so users can't read others' posts
        Post post = postRepository.findByIdAndUserId(postId, userDetails.getUser().getId());
        if (post == null) {
            throw new InformationNotFoundException("post with ID " + postId + " not found!");
        } else {
            return  post;
        }
    }

    // create a post owned by the logged-in user, rejecting duplicate titles
    public Post createSinglePost(Post postObject) {
        System.out.println("service calling createSinglePost ==>");
        MyUserDetails userDetails = (MyUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        // guard against the same user posting two posts with an identical title
        Post post = postRepository.findByUserIdAndTitle(userDetails.getUser().getId(), postObject.getTitle());
        if (post != null) {
            throw new InformationExistException("post with title " + post.getTitle() + " already exists");
        } else {
            // every post gets a fresh 1:1 ReactionsCount row to aggregate reactions
            ReactionsCount reactionsCount = new ReactionsCount();
            reactionsCount.setPost(postObject);
            postObject.setReactionsCount(reactionsCount);
            // stamp ownership and creation time before persisting
            postObject.setUser(userDetails.getUser());
            postObject.setDate(new Date());
            return postRepository.save(postObject);
        }
    }

    // update title/content of a post the logged-in user owns
    public Post updateSinglePost(Long postId, Post postObject) {
        System.out.println("service calling updateSinglePost ==>");
        MyUserDetails userDetails = (MyUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        // only the owner's copy of the post is editable
        Post post = postRepository.findByIdAndUserId(postId, userDetails.getUser().getId());
        if (post != null) {
            // no-op edits (same title) are treated as a conflict rather than saved
            if (post.getTitle().equals(postObject.getTitle())) {
                throw new InformationExistException("post with title " + post.getTitle() + " already exist");
            } else {
                post.setTitle(postObject.getTitle());
                post.setContent(postObject.getContent());
                post.setDate(new Date()); // edit time & date
                return postRepository.save(post);
            }
        } else {
            throw new InformationNotFoundException("post with ID " + postId + " not found!");
        }
    }

    // delete a single post the logged-in user owns, returning a status payload
    public ResponseEntity<?> deleteSinglePost(Long postId) {
        System.out.println("service calling deleteSinglePost ==>");
        MyUserDetails userDetails = (MyUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        // ownership check: users may only delete their own posts
        Post post = postRepository.findByIdAndUserId(postId, userDetails.getUser().getId());
        if (post != null) {
            postRepository.deleteById(postId);
            // hand back a simple {"status": "..."} message instead of the deleted entity
            HashMap<String, String> responseMessage = new HashMap<>();
            responseMessage.put("status", "post with id: " + postId + " was successfully deleted");
            return new ResponseEntity<>(responseMessage, HttpStatus.OK);
        } else {
            throw new InformationNotFoundException("post with ID " + postId + " not found!");
        }
    }

    // bulk-delete every post belonging to the logged-in user
    public ResponseEntity<?> deleteAllPosts() {
        System.out.println("service calling deleteAllPosts ==>");
        MyUserDetails userDetails = (MyUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        // collect the caller's posts only, so other users' data is untouched
        List<Post> posts = postRepository.findByUserId(userDetails.getUser().getId());
        if (!posts.isEmpty()) {
            postRepository.deleteAll(posts);
            HashMap<String, String> responseMessage = new HashMap<>();
            responseMessage.put("status", "all posts for user " + userDetails.getUsername() + " successfully deleted");
            return new ResponseEntity<>(responseMessage, HttpStatus.OK);
        } else {
            // nothing to delete -> treat as not found
            throw new InformationNotFoundException("Could not find any posts for user " + userDetails.getUsername());
        }
    }

    // create a new comment authored by the logged-in user on the given post
    public Comment commentOnPost(Long postId, Comment commentObject) {
        System.out.println("service calling commentOnPost =====>");
        // pull the authenticated user out of the security context so we can stamp authorship
        MyUserDetails userDetails = (MyUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Post> post = postRepository.findById(postId);
        if (post.isPresent()) {
            // link the comment to its parent post and record when/who it came from
            commentObject.setPost(post.get());
            commentObject.setDate(new Date());
            commentObject.setUser(userDetails.getUser());
            return commentRepository.save(commentObject);
        } else {
            // no such post -> surface a 404-style domain exception
            throw new InformationNotFoundException("post with ID " + postId + " not found!");
        }
    }


    /**
     * Returns every comment on the given post. Comments are publicly readable, so
     * there is no owner check; they are loaded via the Post's JPA relationship.
     */
    public List<Comment> getAllCommentsOnPost(Long postId) {
        Optional<Post> optionalPost = postRepository.findById(postId);
        if (optionalPost.isPresent()) {
            return optionalPost.get().getComments();
        }
        else {
            throw new InformationNotFoundException("post with ID " + postId + " not found!");
        }
    }

    /**
     * Edits an existing comment's text, looked up by commentId alone. The comment's
     * date is refreshed to now on every edit. Note there is no author check here, so
     * any authenticated caller can edit any comment; throws if the id does not exist.
     */
    public Comment editCommentOnPost(Long commentId, Comment commentObject) {
        System.out.println("service calling updatePostComment==>");
        Optional<Comment> optionalComment = commentRepository.findById(commentId);
        if (optionalComment.isPresent()) {
            Comment comment = optionalComment.get();
            comment.setText(commentObject.getText());
            comment.setDate(new Date()); // edit time & date
            return commentRepository.save(comment);
        } else {
            throw new InformationNotFoundException("comment or post not found");
        }
    }

    public ResponseEntity<?> deleteCommentOnPost(Long postId, Long commentId) {
        System.out.println("service calling deleteCommentsOnPost ==>");
        MyUserDetails userDetails = (MyUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        Post post = postRepository.findByIdAndUserId(postId, userDetails.getUser().getId());
        if (post == null) {
            throw new InformationNotFoundException("post with id " + postId +
                    " does not belongs to this user or post does not exist");
        }
        Optional<Comment> comment = commentRepository.findByIdAndPostId(commentId, postId);
        if (comment.isEmpty()) {
            throw new InformationNotFoundException("comment with id " + commentId +
                    " does not belongs to this user or comment does not exist");
        } else {
            commentRepository.deleteById(comment.get().getId());
        }
        HashMap<String, String> responseMessage = new HashMap<>();
        responseMessage.put("status", "comment with id: " + commentId + " was successfully deleted");
        return new ResponseEntity<>(responseMessage, HttpStatus.OK);
    }

    public ResponseEntity<?> deleteAllCommentsOnPost(Long postId) {
        System.out.println("service calling deleteAllCommentsOnPost ==>");
        MyUserDetails userDetails = (MyUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        Post post = postRepository.findByIdAndUserId(postId, userDetails.getUser().getId());
        if (post == null) {
            throw new InformationNotFoundException("post with id " + postId +
                    " does not belongs to this user or post does not exist");
        } else {
            List<Comment> comments = commentRepository.findByPostIdAndUserId(postId, userDetails.getUser().getId());
            commentRepository.deleteAll(comments);
        }
        HashMap<String, String> responseMessage = new HashMap<>();
        responseMessage.put("status", "all comments on post with id: " + postId + " were successfully deleted");
        return new ResponseEntity<>(responseMessage, HttpStatus.OK);
    }

    // add a reaction (like/laugh/angry/sad) from the logged-in user to a post
    public Post postReactions(String reactionType, Long postId) {
        Optional<Post> post = postRepository.findById(postId);
        // pull the authenticated user off the security context
        MyUserDetails userDetails = (MyUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        if (post.isPresent()) {
            // per-post aggregate row holding the running count for each reaction type
            ReactionsCount reactionsCount = reactionsCountRepository.findByPostId(postId);
            // one reaction per user per post - reject if this user already reacted
            boolean alreadyReacted = reactionsRepository.existsByUserIdAndPostId(userDetails.getUser().getId(), postId);
            if (alreadyReacted) {
                throw new InformationExistException("reaction of "+ reactionType + " cannot be added as there is another reaction submitted!");
            }
            Reactions newReactions = new Reactions();
            // bump the counter that matches the requested reaction type
            switch (reactionType) {
                case "like":

                    Long likesCount = reactionsCount.getLike();
                    likesCount++;
                    reactionsCount.setLike(likesCount);

                    break;
                case "laugh":
                    Long laughCount = reactionsCount.getLaugh();
                    laughCount++;
                    reactionsCount.setLaugh(laughCount);
                    break;
                case "angry":
                    Long angryCount = reactionsCount.getAngry();
                    angryCount++;
                    reactionsCount.setAngry(angryCount);
                    break;
                case "sad":
                    Long sadCount = reactionsCount.getSad();
                    sadCount++;
                    reactionsCount.setSad(sadCount);
                    break;
                default:
                    // unknown reaction string - nothing was mutated, so just bail out
                    throw new ReactionInvalidException("User trying to submit a reaction cannot find " + reactionType + " reaction");
            }
            // record the individual reaction (who reacted to what) ...
            newReactions.setUser(userDetails.getUser());
            newReactions.setPost(post.get());
            reactionsRepository.save(newReactions);
            // ... and persist the updated per-post totals
            reactionsCountRepository.save(reactionsCount);
            return post.get();
        } else {
            throw new InformationNotFoundException("Post with id " + postId + " not found");
        }
    }
}



import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faPlus,
  faArrowLeft,
  faTimes,
  faThumbsUp,
  faThumbsDown,
  faBell,
  faBellSlash,
} from "@fortawesome/free-solid-svg-icons";

interface Post {
  id: string;
  subject: string;
  body: string;
  timestamp: string;
  username: string;
  userId: string;
  zip: string;
  edited?: boolean;
  link?: string;
}

const NewsFeed = () => {
  const { zip } = useParams<{ zip: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ subject: "", body: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [postReactions, setPostReactions] = useState<
    Map<string, { thumbsUp: boolean; thumbsDown: boolean }>
  >(new Map());
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [link, setLink] = useState<string>("");

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!currentUserId || !zip) return;

    const checkSubscription = async () => {
      try {
        const docRef = doc(db, "subscriptions", currentUserId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const zipCodes = data.zipCodes || [];
          setIsSubscribed(zipCodes.includes(zip));
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    checkSubscription();
  }, [currentUserId, zip]);

  const handleSubscribe = async () => {
    if (!currentUserId || !zip) return;

    try {
      const docRef = doc(db, "subscriptions", currentUserId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const zipCodes = Array.isArray(data.zipCodes) ? data.zipCodes : [];
        await updateDoc(docRef, {
          zipCodes: Array.from(new Set([...zipCodes, zip])),
        });
      } else {
        await setDoc(docRef, {
          userId: currentUserId,
          zipCodes: [zip],
        });
      }

      setIsSubscribed(true);
    } catch (error) {
      console.error("Error subscribing to zip code:", error);
    }
  };

  const handleUnsubscribe = async () => {
    if (!currentUserId || !zip) return;

    try {
      const docRef = doc(db, "subscriptions", currentUserId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const updatedZipCodes = docSnap
          .data()
          .zipCodes.filter((subscribedZip: string) => subscribedZip !== zip);

        if (updatedZipCodes.length > 0) {
          await updateDoc(docRef, { zipCodes: updatedZipCodes });
        } else {
          await deleteDoc(docRef);
        }

        setIsSubscribed(false);
      }
    } catch (error) {
      console.error("Error unsubscribing from zip code:", error);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), where("zip", "==", zip));
        const querySnapshot = await getDocs(q);
        const postsArray: Post[] = [];

        querySnapshot.forEach((docSnap) => {
          const postData = docSnap.data() as Post;
          const postWithId = { ...postData, id: docSnap.id };
          postsArray.push(postWithId);
        });

        setPosts(postsArray);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
    };

    fetchPosts();
  }, [zip]);

  const sortedPosts = [...posts].sort((a, b) => {
    const aDate = new Date(a.timestamp);
    const bDate = new Date(b.timestamp);
    return sortOrder === "asc"
      ? aDate.getTime() - bDate.getTime()
      : bDate.getTime() - aDate.getTime();
  });

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLink(e.target.value);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date().toLocaleString();

    if (!currentUserId) {
      console.error("No user is signed in.");
      return;
    }

    const userDoc = await getDoc(doc(db, "users", currentUserId));

    if (!userDoc.exists()) {
      console.error("User document not found.");
      return;
    }

    const username = userDoc.data()?.username;

    if (!username) {
      console.error("Username is undefined.");
      return;
    }

    const newEntry: Omit<Post, "id"> = {
      timestamp,
      zip: zip ?? "",
      username,
      userId: currentUserId,
      edited: false,
      subject: newPost.subject,
      body: newPost.body,
      link,
    };

    try {
      if (editingPost) {
        const postRef = doc(db, "posts", editingPost.id);
        await updateDoc(postRef, {
          ...newEntry,
          edited: true,
          timestamp,
        });
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === editingPost.id
              ? { ...post, ...newEntry, timestamp, edited: true }
              : post
          )
        );
      } else {
        const addedDoc = await addDoc(collection(db, "posts"), newEntry);
        setPosts((prevPosts) => [
          ...prevPosts,
          { ...newEntry, id: addedDoc.id },
        ]);
      }
    } catch (error) {
      console.error("Error adding/updating post: ", error);
    }

    setNewPost({ subject: "", body: "" });
    setLink("");
    setShowForm(false);
    setEditingPost(null);
  };

  const handleDeletePost = async () => {
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "posts", confirmDelete));
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post.id !== confirmDelete)
        );
        setConfirmDelete(null);
      } catch (error) {
        console.error("Error deleting post: ", error);
      }
    }
  };

  const handleThumbReaction = (
    postId: string,
    reactionType: "thumbsUp" | "thumbsDown"
  ) => {
    setPostReactions((prevReactions) => {
      const updatedReactions = new Map(prevReactions);
      const currentReactions = updatedReactions.get(postId) || {
        thumbsUp: false,
        thumbsDown: false,
      };

      if (reactionType === "thumbsUp") {
        currentReactions.thumbsUp = !currentReactions.thumbsUp;
      } else if (reactionType === "thumbsDown") {
        currentReactions.thumbsDown = !currentReactions.thumbsDown;
      }

      updatedReactions.set(postId, currentReactions);
      return updatedReactions;
    });
  };

  const handleEditPost = (post: Post) => {
    setNewPost({ subject: post.subject, body: post.body });
    setEditingPost(post);
    setShowForm(true);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const toggleShowForm = () => {
    setShowForm((prev) => !prev);
    if (showForm) {
      setNewPost({ subject: "", body: "" });
      setEditingPost(null);
    }
  };

  const toggleSortOrder = (order: "asc" | "desc") => {
    setSortOrder(order);
  };

  const handleConfirmDelete = (postId: string) => {
    setConfirmDelete(postId);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  if (!currentUserId) {
    return <p>Please sign in to view and manage posts.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-800 p-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            Posts for ZIP Code: {zip}
            <div className="ml-4">
              {isSubscribed ? (
                <button
                  onClick={handleUnsubscribe}
                  className="p-2 bg-red-400 hover:bg-red-500 text-white rounded-full"
                >
                  <FontAwesomeIcon icon={faBellSlash} className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={handleSubscribe}
                  className="p-2 bg-green-400 hover:bg-green-500 text-white rounded-full"
                >
                  <FontAwesomeIcon icon={faBell} className="w-6 h-6" />
                </button>
              )}
            </div>
          </h1>
          <button
            onClick={handleBack}
            className="text-gray-500 hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
          </button>
        </div>

        {sortedPosts.length > 0 ? (
          <div>
            {sortedPosts.map((post) => (
              <div
                key={post.id}
                className="mb-4 p-4 border rounded bg-gray-100"
              >
                <h2 className="text-xl font-bold">
                  {post.subject}{" "}
                  {post.edited && (
                    <span className="text-gray-500">(Edited)</span>
                  )}
                </h2>
                <p>{post.body}</p>
                <span className="text-gray-500 text-sm">
                  Posted by: {post.username} on {post.timestamp}
                </span>

                {post.link && (
                  <div className="mt-2">
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {post.link}
                    </a>
                  </div>
                )}

                {post.userId === currentUserId && (
                  <div className="mt-2 flex justify-between items-center space-x-2">
                    <div className="flex justify-start space-x-2">
                      <button
                        onClick={() => handleThumbReaction(post.id, "thumbsUp")}
                        className={`text-gray-500 ${
                          postReactions.get(post.id)?.thumbsUp
                            ? "text-blue-500"
                            : ""
                        }`}
                      >
                        <FontAwesomeIcon icon={faThumbsUp} />
                      </button>
                      <button
                        onClick={() =>
                          handleThumbReaction(post.id, "thumbsDown")
                        }
                        className={`text-gray-500 ${
                          postReactions.get(post.id)?.thumbsDown
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        <FontAwesomeIcon icon={faThumbsDown} />
                      </button>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="text-gray-500 hover:text-gray-600"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleConfirmDelete(post.id)}
                        className="text-gray-500 hover:text-gray-600"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No posts yet for this ZIP code.</p>
        )}

        <div className="mt-4 flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Sort By:</span>

            {sortOrder === "asc" ? (
              <button
                onClick={() => toggleSortOrder("desc")}
                className="text-gray-500 hover:text-gray-600"
              >
                Descending
              </button>
            ) : (
              <button
                onClick={() => toggleSortOrder("asc")}
                className="text-gray-500 hover:text-gray-600"
              >
                Ascending
              </button>
            )}
          </div>

          <button onClick={toggleShowForm} className="text-gray-500">
            <FontAwesomeIcon
              icon={showForm ? faTimes : faPlus}
              className="w-5 h-5"
            />
          </button>
        </div>

        {showForm && (
          <form onSubmit={handlePostSubmit} className="mt-4">
            <input
              type="text"
              placeholder="Subject"
              value={newPost.subject}
              onChange={(e) =>
                setNewPost({ ...newPost, subject: e.target.value })
              }
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <textarea
              placeholder="Body"
              value={newPost.body}
              onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
              className="w-full px-4 py-2 border rounded mb-4"
            />

            <input
              type="url"
              placeholder="Optional Link"
              value={link}
              onChange={handleLinkChange}
              className="w-full px-4 py-2 border rounded mb-4"
            />

            <button
              type="submit"
              className="w-1/6 px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded"
            >
              {editingPost ? "Update Post" : "Create Post"}
            </button>
          </form>
        )}

        {confirmDelete && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-xl mb-4">
                Are you sure you want to delete this post?
              </h2>
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={handleDeletePost}
                  className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded w-1/2"
                >
                  Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded w-1/2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;

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
}

const NewsFeed = () => {
  const { zip } = useParams<{ zip: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ subject: "", body: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null); // state for the post to delete

  const currentUserId = auth.currentUser?.uid;

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
    setShowForm(false);
    setEditingPost(null);
  };

  const handleDeletePost = async () => {
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "posts", confirmDelete));
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== confirmDelete));
        setConfirmDelete(null);
      } catch (error) {
        console.error("Error deleting post: ", error);
      }
    }
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
          <h1 className="text-2xl font-bold text-gray-800">
            Posts for ZIP Code: {zip}
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
                {post.userId === currentUserId && (
                  <div className="mt-2 flex items-end justify-end space-x-2">
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
          <form
            onSubmit={handlePostSubmit}
            className="mt-4 bg-gray-200 p-4 rounded"
          >
            <div className="mb-4">
              <input
                type="text"
                placeholder="Subject"
                value={newPost.subject}
                onChange={(e) =>
                  setNewPost({ ...newPost, subject: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Body"
                value={newPost.body}
                onChange={(e) =>
                  setNewPost({ ...newPost, body: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              {editingPost ? "Update Post" : "Create Post"}
            </button>
          </form>
        )}

        {confirmDelete && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-xl mb-4">Are you sure you want to delete this post?</h2>
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

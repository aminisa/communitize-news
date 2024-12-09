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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

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

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const handleDeletePostConfirmed = async () => {
    if (postToDelete) {
      try {
        await deleteDoc(doc(db, "posts", postToDelete));
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post.id !== postToDelete)
        );
      } catch (error) {
        console.error("Error deleting post: ", error);
      }
    }
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
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
                      onClick={() => setEditingPost(post)}
                      className="text-gray-500 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(post.id)}
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
          <p>No posts found for this ZIP code.</p>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold">
              Are you sure you want to delete this post?
            </h2>
            <div className="mt-4 flex justify-center space-x-4 items-center">
              <button
                onClick={handleDeletePostConfirmed}
                className="bg-red-400 text-white p-2 rounded hover:bg-red-600 w-1/2"
              >
                Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="bg-gray-400 text-white p-2 rounded hover:bg-gray-600 w-1/2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

interface Post {
  subject: string;
  body: string;
  timestamp: string;
  username: string;
}

const NewsFeed = () => {
  const { zip } = useParams<{ zip: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ subject: "", body: "" });
  const [showForm, setShowForm] = useState(false);

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), where("zip", "==", zip));
        const querySnapshot = await getDocs(q);
        const postsArray: Post[] = [];

        querySnapshot.forEach((doc) => {
          postsArray.push(doc.data() as Post);
        });

        setPosts(postsArray);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
    };

    fetchPosts();
  }, [zip]);

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

    const newEntry = { ...newPost, timestamp, zip, username };

    try {
      await addDoc(collection(db, "posts"), newEntry);
      setPosts((prevPosts) => [...prevPosts, newEntry]);
    } catch (error) {
      console.error("Error adding post: ", error);
    }

    setNewPost({ subject: "", body: "" });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-800 p-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Posts for ZIP Code: {zip}
        </h1>

        {posts.length > 0 ? (
          <div>
            {posts.map((post, index) => (
              <div key={index} className="mb-4 p-4 border rounded bg-gray-100">
                <h2 className="text-xl font-bold">{post.subject}</h2>
                <p>{post.body}</p>
                <span className="text-gray-500 text-sm">
                  Posted by: {post.username} on {post.timestamp}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p>No posts yet for this ZIP code.</p>
        )}

        <button
          onClick={() => setShowForm(true)}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Create Post
        </button>

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
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Post
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;

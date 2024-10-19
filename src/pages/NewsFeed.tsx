import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

interface Post {
  subject: string;
  body: string;
  timestamp: string;
}

const NewsFeed = () => {
  const { zip } = useParams<{ zip: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ subject: "", body: "" });
  const [showForm, setShowForm] = useState(false);

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
    const newEntry = { ...newPost, timestamp, zip };

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
                  Posted on: {post.timestamp}
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
              <label htmlFor="subject" className="block font-bold mb-2">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={newPost.subject}
                onChange={(e) =>
                  setNewPost({ ...newPost, subject: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="body" className="block font-bold mb-2">
                Body
              </label>
              <textarea
                id="body"
                value={newPost.body}
                onChange={(e) =>
                  setNewPost({ ...newPost, body: e.target.value })
                }
                className="w-full p-2 border rounded"
                rows={4}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;

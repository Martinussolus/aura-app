'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Post {
  id: string;
  message_content: string;
  created_at: string;
}

const CreatorPage = ({ params }: { params: { username: string } }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // Fetch the user by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', params.username)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user:', userError);
        return;
      }
      setUser(userData);

      // Fetch the posts for that user
      const { data: postData, error: postError } = await supabase
        .from('content')
        .select('id, message_content, created_at')
        .eq('creator_id', userData.id)
        .order('created_at', { ascending: false });

      if (postError) {
        console.error('Error fetching posts:', postError);
      } else {
        setPosts(postData);
      }
    };

    fetchUserData();
  }, [params.username]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">{user.username}'s Profile</h1>

      <div className="w-full max-w-md">
        {posts.map((post) => (
          <div key={post.id} className="border p-4 rounded-lg mb-4">
            <p>{post.message_content}</p>
            <p className="text-sm text-gray-500 mt-2">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default CreatorPage;

import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FeedComponent from '../components/Feed';
import Rightbar from '../components/Rightbar';

const Feed = () => {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <Navbar />
      <div className="max-w-[1600px] mx-auto flex justify-center pt-4 px-0 lg:px-4 pb-4 gap-4">
        <Sidebar />
        <FeedComponent />
        <Rightbar />
      </div>
    </div>
  );
};

export default Feed;

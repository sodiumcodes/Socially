// Static profile data for demo purposes
export const profileData = {
    user: {
        name: "Naina Dugar",
        initials: "ND",
        isVerified: true,
        tag: "STUDENT",
        bio: "Learning and connecting.",
        location: "Bengaluru",
        education: "School of Technology",
        batch: "Batch of 2024"
    },

    stats: {
        posts: 0,
        followers: 0,
        following: 0
    },

    posts: [
        {
            id: 1,
            image: "https://via.placeholder.com/400x300/e0c3fc/000000?text=Post+1",
            caption: "My recent post...",
            likes: 0,
            comments: 0,
            visibility: "All" // Show Share button
        },
        {
            id: 2,
            image: "https://via.placeholder.com/400x300/f8b4d4/000000?text=Post+2",
            caption: "My recent post...",
            likes: 0,
            comments: 0,
            visibility: "Custom" // Show "Customized" label instead
        },
        {
            id: 3,
            image: "https://via.placeholder.com/400x300/c3b1e1/000000?text=Post+3",
            caption: "My recent post...",
            likes: 0,
            comments: 0,
            visibility: "All" // Show Share button
        }
    ]
};

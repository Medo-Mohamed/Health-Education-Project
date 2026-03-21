import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: "success",
  data: {
    user: {
      id: "u987654321",
      username: "coder_pro",
      full_name: "أحمد محمد",
      email: "ahmed.dev@example.com",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
      role: "admin",
      bio: "مطور واجهات أمامية مهتم بتقنيات React و Node.js",
      location: {
        country: "Egypt",
        city: "Cairo",
        timezone: "UTC+2",
      },
      permissions: {
        "posts:create": true,
        "posts:edit": true,
        "posts:delete:own": true,
        "comments:approve": true,
        "media:upload": true,
        "dashboard:view": true,
      },
      social_links: {
        github: "https://github.com/ahmed",
        linkedin: "https://linkedin.com/in/ahmed",
      },
      preferences: {
        theme: "dark",
        language: "ar",
        notifications_enabled: true,
      },
      stats: {
        posts_count: 12,
        followers: 150,
        following: 85,
      },
      created_at: "2024-01-15T10:30:00Z",
      last_login: "2026-03-21T09:15:22Z",
      is_verified: true,
    },
  },
};

export const UserSlice = createSlice({
  name: "User",
  initialState: initialState,
  reducers: {
    setUser: (state, action) => {
      state.data.user = action.payload;
    },
  },
});

export const { setUser } = UserSlice.actions;

export default UserSlice.reducer;

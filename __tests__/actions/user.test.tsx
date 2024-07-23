import { mock } from "jest-mock-extended";

import {
  updateUser,
  fetchUser,
  fetchUsers,
  getActivity,
  fetchUserEvents,
  getEventActivity,
} from "@/lib/actions/user.actions";
import User from "@/lib/models/user.model";
import Community from "@/lib/models/community.model";
import { connectToDatabase } from "@/lib/mongoose";
import Post from "@/lib/models/post.model";
import PostModel from "@/lib/models/post.model";
import UserModel from "@/lib/models/user.model";

jest.mock("@/lib/mongoose");
jest.mock("@/lib/models/user.model");
jest.mock("@/lib/models/community.model");
jest.mock("@/lib/models/post.model");

const mockedConnectToDatabase = jest.mocked(connectToDatabase);
const mockedUserModel = User as jest.Mocked<typeof User>;
const mockedPostModel = Post as jest.Mocked<typeof Post>;

describe("User Actions", () => {
  beforeEach(() => {
    mockedConnectToDatabase.mockClear();
    jest.clearAllMocks();
  });

  describe("updateUser", () => {
    it("should update user and revalidate path", async () => {
      const params = {
        userId: "userId",
        username: "username",
        name: "name",
        bio: "bio",
        image: "image",
        path: "/profile/edit",
      };

      mockedUserModel.findOneAndUpdate.mockResolvedValueOnce(null);

      await updateUser(params);

      expect(connectToDatabase).toHaveBeenCalled();
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { id: params.userId },
        {
          username: params.username.toLowerCase(),
          name: params.name,
          bio: params.bio,
          image: params.image,
          onboarded: true,
        },
        { upsert: true }
      );
    });
  });

  describe("fetchUser", () => {
    it("should fetch user data", async () => {
      const userId = "user_id_to_fetch";
      const mockUser = {
        id: userId,
        username: "testuser",
        name: "Test User",
        bio: "Testing bio",
        image: "test_image.jpg",
        communities: [],
      };

      const populateMock = jest.fn().mockResolvedValue(mockUser);
      mockedUserModel.findOne.mockImplementation(() => ({
        populate: populateMock,
      }));

      const result = await fetchUser(userId);

      expect(result).toEqual(
        expect.objectContaining({
          id: userId,
          username: "testuser",
          name: "Test User",
          bio: "Testing bio",
          image: "test_image.jpg",
          communities: [],
        })
      );

      expect(User.findOne).toHaveBeenCalledWith({ id: userId });
      expect(populateMock).toHaveBeenCalledWith({
        path: "communities",
        model: Community,
      });
    });
  });

  describe("fetchUsers", () => {
    it("should fetch users with default parameters", async () => {
      const userId = "user_id_here";
      const mockUsers = [
        { id: "user1", username: "user1", name: "User One" },
        { id: "user2", username: "user2", name: "User Two" },
      ];

      // Mock User.find to return a mock query object
      const mockQuery = {
        sort: jest.fn().mockReturnThis(), // Mock sort method
        skip: jest.fn().mockReturnThis(), // Mock skip method
        limit: jest.fn().mockReturnThis(), // Mock limit method
        exec: jest.fn().mockResolvedValue(mockUsers), // Mock exec method
      };
      mockedUserModel.find.mockReturnValue(mockQuery as any); // Cast as any to satisfy typings

      // Mock User.countDocuments to resolve with total count
      mockedUserModel.countDocuments.mockResolvedValue(mockUsers.length);

      // Call fetchUsers with default parameters
      const result = await fetchUsers({ userId });

      // Assertions
      expect(mockedConnectToDatabase).toHaveBeenCalled();
      expect(mockedUserModel.find).toHaveBeenCalledWith({
        id: { $ne: userId },
      });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: "desc" });
      expect(mockQuery.skip).toHaveBeenCalledWith(0); // Default pageNumber = 1, pageSize = 20
      expect(mockQuery.limit).toHaveBeenCalledWith(20);
      expect(result.users).toEqual(mockUsers);
      expect(result.isNext).toBeFalsy(); // Only 2 users, so no more next page
    });
  });

  it("should handle error when fetching activity", async () => {
    const userId = "user123";
    const mockUserPosts = [
      { _id: "post1", author: userId, children: ["child1", "child2"] },
      { _id: "post2", author: userId, children: ["child3"] },
    ];

    // Mock PostModel.find() to throw an error
    jest
      .spyOn(PostModel, "find")
      .mockRejectedValueOnce(new Error("Database connection error"));

    // Call getActivity function and expect it to throw an error
    await expect(getActivity(userId)).rejects.toThrowError(
      "Failed to fetch activity: Database connection error"
    );

    // Verify mocks
    expect(PostModel.find).toHaveBeenCalledTimes(1); // Called once for user posts
  });
});

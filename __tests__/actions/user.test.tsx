import { mock } from "jest-mock-extended";
import {
  updateUser,
  fetchUser,
  fetchUserPosts,
  fetchUsers,
  getActivity,
  fetchUserEvents,
  getEventActivity,
} from "@/lib/actions/user.actions";
import User from "@/lib/models/user.model";
import Post from "@/lib/models/post.model";
import Event from "@/lib/models/event.model";
import Community from "@/lib/models/community.model";
import { connectToDatabase } from "@/lib/mongoose";
import { describe, beforeEach, it } from "node:test";

jest.mock("@/lib/mongoose");
jest.mock("@/lib/models/user.model");
jest.mock("@/lib/models/post.model");
jest.mock("@/lib/models/event.model");
jest.mock("@/lib/models/community.model");

const mockedConnectToDatabase = jest.mocked(connectToDatabase);
const mockedUserModel = mock<typeof User>();
const mockedPostModel = mock<typeof Post>();
const mockedEventModel = mock<typeof Event>();
const mockedCommunityModel = mock<typeof Community>();

describe("User Actions", () => {
  beforeEach(() => {
    mockedConnectToDatabase.mockClear();
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
    it("should fetch a user", async () => {
      const userId = "userId";
      const mockUser = { id: userId, communities: [] };
      mockedUserModel.findOne.mockResolvedValueOnce(mockUser as any);

      const user = await fetchUser(userId);

      expect(connectToDatabase).toHaveBeenCalled();
      expect(User.findOne).toHaveBeenCalledWith({ id: userId });
      expect(user).toEqual(mockUser);
    });
  });

  describe("fetchUserPosts", () => {
    it("should fetch user posts", async () => {
      const userId = "userId";
      const mockUserPosts = [{ id: "postId", children: [] }];
      mockedUserModel.findOne.mockResolvedValueOnce({
        populate: jest.fn().mockResolvedValue(mockUserPosts),
      } as any);

      const posts = await fetchUserPosts(userId);

      expect(connectToDatabase).toHaveBeenCalled();
      expect(User.findOne).toHaveBeenCalledWith({ id: userId });
      expect(posts).toEqual(mockUserPosts);
    });
  });

  describe("fetchUsers", () => {
    it("should fetch users", async () => {
      const params = {
        userId: "userId",
        searchString: "",
        pageNumber: 1,
        pageSize: 20,
        sortBy: "desc" as const,
      };

      const mockUsers = [{ id: "userId1" }, { id: "userId2" }];
      mockedUserModel.find.mockReturnValueOnce({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockUsers),
            }),
          }),
        }),
      } as any);

      const result = await fetchUsers(params);

      expect(connectToDatabase).toHaveBeenCalled();
      expect(User.find).toHaveBeenCalledWith({ id: { $ne: params.userId } });
      expect(result.users).toEqual(mockUsers);
    });
  });

  describe("getActivity", () => {
    it("should fetch user activity", async () => {
      const userId = "userId";
      const mockPosts = [{ author: userId, children: [] }];
      const mockReplies = [{ author: "anotherUser", _id: "postId" }];

      mockedPostModel.find.mockResolvedValueOnce(mockPosts as any);
      mockedPostModel.find.mockResolvedValueOnce({
        populate: jest.fn().mockResolvedValue(mockReplies),
      } as any);

      const activity = await getActivity(userId);

      expect(connectToDatabase).toHaveBeenCalled();
      expect(Post.find).toHaveBeenCalledWith({ author: userId });
      expect(activity).toEqual(
        mockReplies.map((reply) => ({
          ...reply,
          type: "comment",
        }))
      );
    });
  });

  describe("fetchUserEvents", () => {
    it("should fetch user events", async () => {
      const userId = "userId";
      const mockUserEvents = { id: userId, events: [] };
      mockedUserModel.findOne.mockResolvedValueOnce({
        populate: jest.fn().mockResolvedValue(mockUserEvents),
      } as any);

      const events = await fetchUserEvents(userId);

      expect(connectToDatabase).toHaveBeenCalled();
      expect(User.findOne).toHaveBeenCalledWith({ id: userId });
      expect(events).toEqual(mockUserEvents);
    });
  });

  describe("getEventActivity", () => {
    it("should fetch event activity", async () => {
      const userId = "userId";
      const mockEvents = [{ author: userId, children: [] }];
      const mockReplies = [{ author: "anotherUser", _id: "eventId" }];

      mockedEventModel.find.mockResolvedValueOnce(mockEvents as any);
      mockedEventModel.find.mockResolvedValueOnce({
        populate: jest.fn().mockResolvedValue(mockReplies),
      } as any);

      const activity = await getEventActivity(userId);

      expect(connectToDatabase).toHaveBeenCalled();
      expect(Event.find).toHaveBeenCalledWith({ author: userId });
      expect(activity).toEqual(
        mockReplies.map((reply) => ({
          ...reply,
          type: "event",
        }))
      );
    });
  });
});

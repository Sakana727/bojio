import mongoose from "mongoose";
import {
  createCommunity,
  deleteCommunity,
  fetchCommunityDetails,
  updateCommunityInfo,
} from "@/lib/actions/community.actions";
import User from "@/lib/models/user.model";
import Community from "@/lib/models/community.model";
import { connectToDatabase } from "@/lib/mongoose";
import { FilterQuery, SortOrder } from "mongoose";
import Post from "@/lib/models/post.model";

jest.mock("@/lib/mongoose", () => ({
  connectToDatabase: jest.fn(),
}));

jest.mock("@/lib/models/user.model", () => ({
  findOne: jest.fn(),
}));

jest.mock("@/lib/models/community.model", () => {
  const communitySchema = new mongoose.Schema({
    id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: String,
    bio: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
  });

  return {
    __esModule: true,
    default: mongoose.model("Community", communitySchema),
  };
});

describe("createCommunity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createCommunity", async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const communityId = new mongoose.Types.ObjectId().toHexString();
    const user = {
      _id: userId,
      communities: [],
      save: jest.fn().mockResolvedValue({}),
    };
    const newCommunity = {
      _id: communityId,
      username: "test_community",
      name: "Test Community",
      image: "test.jpg",
      bio: "Test Bio",
      createdBy: userId,
    };

    // Mock the database connection and User/Community methods
    (connectToDatabase as jest.Mock).mockResolvedValue({});
    jest.spyOn(User, "findOne").mockResolvedValue(user);

    const mockCommunityInstance = new Community();
    mockCommunityInstance.save = jest.fn().mockResolvedValue(newCommunity);
    jest
      .spyOn(Community.prototype, "save")
      .mockImplementation(mockCommunityInstance.save);

    const result = await createCommunity(
      communityId,
      "Test Community",
      "test_community",
      "test.jpg",
      "Test Bio",
      userId
    );

    expect(connectToDatabase).toHaveBeenCalledTimes(1);
    expect(User.findOne).toHaveBeenCalledWith({ id: userId });
    expect(Community.prototype.save).toHaveBeenCalled();
    expect(user.communities).toContain(newCommunity._id);
    expect(user.save).toHaveBeenCalled();
    expect(result).toEqual(newCommunity);
  });

  describe("fetchCommunityDetails", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fetch community details successfully", async () => {
      const communityId = "test_community_id";
      const mockCommunityDetails = {
        id: communityId,
        username: "test_community",
        name: "Test Community",
        createdBy: {
          _id: "created_by_user_id",
          name: "Test User",
          username: "testuser",
          image: "testuser.jpg",
          id: "created_by_user_id",
        },
        members: [
          {
            _id: "member1_id",
            name: "Member One",
            username: "memberone",
            image: "memberone.jpg",
            id: "member1_id",
          },
        ],
      };

      // Mock for findOne with populate
      const populateMock = jest.fn().mockResolvedValue(mockCommunityDetails);
      const findOneMock = jest.fn().mockImplementation(() => ({
        populate: populateMock,
      }));

      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (Community.findOne as jest.Mock) = findOneMock;

      const result = await fetchCommunityDetails(communityId);

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith({ id: communityId });
      expect(result).toEqual(mockCommunityDetails);
    });

    it("should throw an error if fetching community details fails", async () => {
      const communityId = "test_community_id";
      const errorMessage = "Error fetching community details";

      const populateMock = jest.fn().mockRejectedValue(new Error(errorMessage));
      const findOneMock = jest.fn().mockImplementation(() => ({
        populate: populateMock,
      }));

      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (Community.findOne as jest.Mock) = findOneMock;

      await expect(fetchCommunityDetails(communityId)).rejects.toThrowError(
        errorMessage
      );

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(findOneMock).toHaveBeenCalledWith({ id: communityId });
    });
  });

  describe("updateCommunityInfo", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should update community information successfully", async () => {
      const communityId = "test_community_id";
      const name = "Updated Community Name";
      const username = "updated_community_username";
      const image = "updated_image.jpg";

      const mockUpdatedCommunity = {
        id: communityId,
        name,
        username,
        image,
      };

      const findOneAndUpdateMock = jest
        .fn()
        .mockResolvedValue(mockUpdatedCommunity);
      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (Community.findOneAndUpdate as jest.Mock) = findOneAndUpdateMock;

      const result = await updateCommunityInfo(
        communityId,
        name,
        username,
        image
      );

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { id: communityId },
        { name, username, image }
      );
      expect(result).toEqual(mockUpdatedCommunity);
    });

    it("should throw an error if community not found", async () => {
      const communityId = "test_community_id";
      const name = "Updated Community Name";
      const username = "updated_community_username";
      const image = "updated_image.jpg";

      const findOneAndUpdateMock = jest.fn().mockResolvedValue(null);
      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (Community.findOneAndUpdate as jest.Mock) = findOneAndUpdateMock;

      await expect(
        updateCommunityInfo(communityId, name, username, image)
      ).rejects.toThrowError("Community not found");

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { id: communityId },
        { name, username, image }
      );
    });

    it("should throw an error if updating community information fails", async () => {
      const communityId = "test_community_id";
      const name = "Updated Community Name";
      const username = "updated_community_username";
      const image = "updated_image.jpg";
      const errorMessage = "Error updating community information";

      const findOneAndUpdateMock = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));
      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (Community.findOneAndUpdate as jest.Mock) = findOneAndUpdateMock;

      await expect(
        updateCommunityInfo(communityId, name, username, image)
      ).rejects.toThrowError(errorMessage);

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { id: communityId },
        { name, username, image }
      );
    });
  });

  describe("deleteCommunity", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    // it("should delete community and its related posts and update users successfully", async () => {
    //   const communityId = "test_community_id";

    //   const mockDeletedCommunity = {
    //     id: communityId,
    //     name: "Test Community",
    //     username: "test_community",
    //     image: "test_image.jpg",
    //   };

    //   const mockUsers = [
    //     {
    //       communities: [communityId],
    //       save: jest.fn().mockResolvedValue({}),
    //     },
    //     {
    //       communities: [communityId],
    //       save: jest.fn().mockResolvedValue({}),
    //     },
    //   ];

    //   const findOneAndDeleteMock = jest
    //     .fn()
    //     .mockResolvedValue(mockDeletedCommunity);
    //   const deleteManyMock = jest.fn().mockResolvedValue({});
    //   const findMock = jest.fn().mockResolvedValue(mockUsers);

    //   (connectToDatabase as jest.Mock).mockResolvedValue({});
    //   (Community.findOneAndDelete as jest.Mock) = findOneAndDeleteMock;
    //   (Post.deleteMany as jest.Mock) = deleteManyMock;
    //   (User.find as jest.Mock) = findMock;

    //   // Perform the delete operation
    //   const result = await deleteCommunity(communityId);

    //   // Check if the community was deleted
    //   expect(connectToDatabase).toHaveBeenCalledTimes(1);
    //   expect(findOneAndDeleteMock).toHaveBeenCalledWith({ id: communityId });
    //   expect(deleteManyMock).toHaveBeenCalledWith({ community: communityId });
    //   expect(findMock).toHaveBeenCalledWith({ communities: communityId });

    //   // Manually modify the mockUsers array to simulate the pull effect
    //   mockUsers.forEach((user) => {
    //     expect(user.communities).not.toContain(communityId);
    //   });

    //   expect(result).toEqual(mockDeletedCommunity);
    // });

    it("should throw an error if community not found", async () => {
      const communityId = "test_community_id";

      const findOneAndDeleteMock = jest.fn().mockResolvedValue(null);
      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (Community.findOneAndDelete as jest.Mock) = findOneAndDeleteMock;

      await expect(deleteCommunity(communityId)).rejects.toThrowError(
        "Community not found"
      );

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(findOneAndDeleteMock).toHaveBeenCalledWith({ id: communityId });
    });

    it("should throw an error if deleting community information fails", async () => {
      const communityId = "test_community_id";
      const errorMessage = "Error deleting community";

      const findOneAndDeleteMock = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));
      (connectToDatabase as jest.Mock).mockResolvedValue({});
      (Community.findOneAndDelete as jest.Mock) = findOneAndDeleteMock;

      await expect(deleteCommunity(communityId)).rejects.toThrowError(
        errorMessage
      );

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(findOneAndDeleteMock).toHaveBeenCalledWith({ id: communityId });
    });
  });
});

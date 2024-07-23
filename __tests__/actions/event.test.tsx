import {
  createEvent,
  fetchEventById,
  deleteEvent,
  fetchAllChildEvents,
  addCommentToEvent,
  addParticipantToEvent,
  fetchParticipants,
  updateEvent,
} from "@/lib/actions/event.actions";
import EventModel from "@/lib/models/event.model";
import UserModel from "@/lib/models/user.model";
import CommunityModel from "@/lib/models/community.model";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongoose";
import mongoose from "mongoose";
import Community from "@/lib/models/community.model";
import User from "@/lib/models/user.model";

jest.mock("@/lib/mongoose", () => ({
  connectToDatabase: jest.fn(),
}));

// Mock revalidatePath directly without applying the method
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Event Actions", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Create Event", () => {
    it("should create an event", async () => {
      const mockParams = {
        title: "Test Event",
        description: "Test Description",
        date: "2024-07-18",
        location: "Test Location",
        image: "test.jpg",
        author: "user123",
        communityId: "community123",
        path: "/events",
      };

      jest.spyOn(UserModel, "findOne").mockResolvedValue({ _id: "author_id" });
      jest
        .spyOn(CommunityModel, "findOne")
        .mockResolvedValue({ _id: "community_id" });
      jest.spyOn(EventModel, "create").mockResolvedValue({ _id: "event123" });
      jest.spyOn(UserModel, "findByIdAndUpdate").mockResolvedValue({});
      jest.spyOn(CommunityModel, "findByIdAndUpdate").mockResolvedValue({});

      // Mock the revalidatePath function

      await createEvent(mockParams);

      expect(EventModel.create).toHaveBeenCalledTimes(1);
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(CommunityModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledTimes(1);
    });
  });

  describe("fetchEventById", () => {
    it("should fetch an event by ID", async () => {
      const eventId = new mongoose.Types.ObjectId();
      const mockEvent = {
        _id: eventId,
        title: "Test Event",
        description: "Test Description",
        date: "2024-07-18",
        location: "Test Location",
        image: "test.jpg",
        author: { _id: "author_id", name: "Author Name", image: "author.jpg" },
        community: {
          _id: "community_id",
          name: "Community Name",
          image: "community.jpg",
        },
        participants: [
          {
            _id: "participant1",
            username: "user1",
            name: "User 1",
            image: "user1.jpg",
          },
        ],
        children: [],
      };

      // Mock implementations
      const mockExec = jest.fn().mockResolvedValue(mockEvent);
      const mockPopulate = jest.fn().mockReturnThis();

      jest.spyOn(EventModel, "findById").mockImplementation(() => ({
        populate: mockPopulate,
        exec: mockExec,
      }));

      const fetchedEvent = await fetchEventById(eventId);

      // Assertions
      expect(EventModel.findById).toHaveBeenCalledWith(eventId);
      expect(mockPopulate).toHaveBeenCalledWith("author", "id name image");
      expect(mockPopulate).toHaveBeenCalledWith({
        path: "community",
        select: "_id name image",
      });
      expect(fetchedEvent).toEqual(mockEvent);
    });
  });

  // describe("deleteEvent", () => {
  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //   });

  //   it("should delete an event and related data successfully", async () => {
  //     const eventId = new mongoose.Types.ObjectId(); // Generate a new ObjectId
  //     const path = "/some-path";
  //     const mockEvent = {
  //       _id: eventId,
  //       author: { _id: new mongoose.Types.ObjectId() }, // Generate a new ObjectId
  //       community: { _id: new mongoose.Types.ObjectId() }, // Generate a new ObjectId
  //     };
  //     const mockDescendants = [
  //       {
  //         _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
  //         author: { _id: new mongoose.Types.ObjectId() }, // Generate a new ObjectId
  //         community: { _id: new mongoose.Types.ObjectId() }, // Generate a new ObjectId
  //       },
  //       {
  //         _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
  //         author: { _id: new mongoose.Types.ObjectId() }, // Generate a new ObjectId
  //         community: { _id: new mongoose.Types.ObjectId() }, // Generate a new ObjectId
  //       },
  //     ];

  //     // Mock function implementations
  //     (connectToDatabase as jest.Mock).mockResolvedValue({});
  //     (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
  //     (fetchAllChildEvents as jest.Mock).mockResolvedValue(mockDescendants);
  //     (Event.deleteMany as jest.Mock).mockResolvedValue({});
  //     (User.updateMany as jest.Mock).mockResolvedValue({});
  //     (Community.updateMany as jest.Mock).mockResolvedValue({});
  //     (revalidatePath as jest.Mock).mockImplementation(() => {});

  //     await deleteEvent(eventId.toHexString(), path); // Convert ObjectId to string for the function call

  //     // Assertions
  //     expect(connectToDatabase).toHaveBeenCalledTimes(1);
  //     expect(Event.findById).toHaveBeenCalledWith(eventId);
  //     expect(fetchAllChildEvents).toHaveBeenCalledWith(eventId);
  //     expect(Event.deleteMany).toHaveBeenCalledWith({
  //       _id: { $in: [eventId, ...mockDescendants.map((e) => e._id)] },
  //     });
  //     expect(User.updateMany).toHaveBeenCalledWith(
  //       {
  //         _id: {
  //           $in: [
  //             mockEvent.author._id,
  //             ...mockDescendants.map((e) => e.author._id),
  //           ],
  //         },
  //       },
  //       {
  //         $pull: {
  //           events: { $in: [eventId, ...mockDescendants.map((e) => e._id)] },
  //         },
  //       }
  //     );
  //     expect(Community.updateMany).toHaveBeenCalledWith(
  //       {
  //         _id: {
  //           $in: [
  //             mockEvent.community._id,
  //             ...mockDescendants.map((e) => e.community._id),
  //           ],
  //         },
  //       },
  //       {
  //         $pull: {
  //           events: { $in: [eventId, ...mockDescendants.map((e) => e._id)] },
  //         },
  //       }
  //     );
  //     expect(revalidatePath).toHaveBeenCalledWith(path);
  //   });
  // });

  describe("updateEvent", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("should update an event with all provided parameters", async () => {
      const updateParams = {
        eventId: "event123",
        title: "Updated Event Title",
        description: "Updated Description",
        date: "2024-07-20",
        location: "Updated Location",
        image: "updated.jpg",
        author: "user123",
        communityId: "community123",
        path: "/events/updated",
      };

      const mockAuthor = { _id: new mongoose.Types.ObjectId() };
      const mockCommunity = { _id: new mongoose.Types.ObjectId() };
      const mockUpdatedEvent = {
        _id: updateParams.eventId,
        ...updateParams,
      };

      jest
        .spyOn(connectToDatabase, "mockResolvedValue")
        .mockResolvedValue(undefined);
      jest.spyOn(UserModel, "findOne").mockResolvedValue(mockAuthor);
      jest.spyOn(CommunityModel, "findOne").mockResolvedValue(mockCommunity);
      jest
        .spyOn(EventModel, "findByIdAndUpdate")
        .mockResolvedValue(mockUpdatedEvent);
      jest
        .spyOn(revalidatePath, "mockResolvedValue")
        .mockResolvedValue(undefined);

      await updateEvent(updateParams);

      expect(connectToDatabase).toHaveBeenCalledTimes(1);
      expect(UserModel.findOne).toHaveBeenCalledWith(
        { id: updateParams.author },
        { _id: 1 }
      );
      expect(CommunityModel.findOne).toHaveBeenCalledWith(
        { id: updateParams.communityId },
        { _id: 1 }
      );
      expect(EventModel.findByIdAndUpdate).toHaveBeenCalledWith(
        updateParams.eventId,
        {
          title: updateParams.title,
          description: updateParams.description,
          date: updateParams.date,
          location: updateParams.location,
          image: updateParams.image,
          author: mockAuthor._id,
          community: mockCommunity._id,
        },
        { new: true }
      );
      expect(revalidatePath).toHaveBeenCalledWith(updateParams.path);
    });
  });
});

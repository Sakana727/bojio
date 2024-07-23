import mongoose from "mongoose";
import {
  createPoll,
  voteOnPoll,
  fetchPollById,
  fetchEventPoll,
  getPollIdByEventId,
  hasUserVoted,
} from "@/lib/actions/poll.actions";
import Poll from "@/lib/models/poll.model";
import Event from "@/lib/models/event.model";
import User from "@/lib/models/user.model";
import { connectToDatabase } from "@/lib/mongoose";
import { revalidatePath } from "next/cache";

// Mocking connectToDatabase
jest.mock("@/lib/mongoose", () => ({
  connectToDatabase: jest.fn(),
}));

// Mocking Poll model
jest.mock("@/lib/models/poll.model", () => {
  const pollSchema = new mongoose.Schema({
    question: String,
    options: [{ optionText: String, votes: Number }],
    voters: [mongoose.Schema.Types.ObjectId],
    eventId: mongoose.Schema.Types.ObjectId,
    createdAt: Date,
  });

  const mockPollModel = mongoose.model("Poll", pollSchema);
  mockPollModel.create = jest.fn();
  mockPollModel.findById = jest.fn();
  mockPollModel.findOne = jest.fn();

  return {
    __esModule: true,
    default: mockPollModel,
  };
});

// Mocking Event model
jest.mock("@/lib/models/event.model", () => {
  const eventSchema = new mongoose.Schema({
    children: [mongoose.Schema.Types.ObjectId],
  });

  const mockEventModel = mongoose.model("Event", eventSchema);
  mockEventModel.findById = jest.fn();
  mockEventModel.findByIdAndUpdate = jest.fn();

  return {
    __esModule: true,
    default: mockEventModel,
  };
});

// Mocking User model
jest.mock("@/lib/models/user.model", () => {
  const userSchema = new mongoose.Schema({
    communities: [String],
  });

  const mockUserModel = mongoose.model("User", userSchema);
  mockUserModel.findById = jest.fn();

  return {
    __esModule: true,
    default: mockUserModel,
  };
});

// Mocking revalidatePath
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Poll Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createPoll", () => {
    // it("should create a poll and update the event successfully", async () => {
    //   const params = {
    //     question: "What is your favorite color?",
    //     options: ["Red", "Blue"],
    //     eventId: "event123",
    //     path: "/some/path",
    //   };

    //   const mockEvent = { _id: "event123" };
    //   const mockPoll = { _id: "poll123" };

    //   (connectToDatabase as jest.Mock).mockImplementation(() =>
    //     Promise.resolve({})
    //   );
    //   (Event.findById as jest.Mock).mockImplementation(() =>
    //     Promise.resolve(mockEvent)
    //   );
    //   (Poll.create as jest.Mock).mockImplementation(() =>
    //     Promise.resolve(mockPoll)
    //   );
    //   (Event.findByIdAndUpdate as jest.Mock).mockImplementation(() =>
    //     Promise.resolve(mockEvent)
    //   );
    //   (revalidatePath as jest.Mock).mockImplementation(() => {});

    //   await createPoll(params);

    //   expect(connectToDatabase).toHaveBeenCalled();
    //   expect(Event.findById).toHaveBeenCalledWith(params.eventId);
    //   expect(Poll.create).toHaveBeenCalledWith({
    //     question: params.question,
    //     options: params.options.map((option) => ({
    //       optionText: option,
    //       votes: 0,
    //     })),
    //     eventId: mockEvent._id,
    //     createdAt: expect.any(Date),
    //   });
    //   expect(Event.findByIdAndUpdate).toHaveBeenCalledWith(mockEvent._id, {
    //     $push: { children: mockPoll._id },
    //   });
    //   expect(revalidatePath).toHaveBeenCalledWith(params.path);
    // });

    it("should throw an error if the event is not found", async () => {
      const params = {
        question: "What is your favorite color?",
        options: ["Red", "Blue"],
        eventId: "event123",
        path: "/some/path",
      };

      (connectToDatabase as jest.Mock).mockImplementation(() =>
        Promise.resolve({})
      );
      (Event.findById as jest.Mock).mockImplementation(() =>
        Promise.resolve(null)
      );

      await expect(createPoll(params)).rejects.toThrow("Event not found");
    });

    it("should throw an error if there is an error creating the poll", async () => {
      const params = {
        question: "What is your favorite color?",
        options: ["Red", "Blue"],
        eventId: "event123",
        path: "/some/path",
      };

      const mockEvent = { _id: "event123" };

      (connectToDatabase as jest.Mock).mockImplementation(() =>
        Promise.resolve({})
      );
      (Event.findById as jest.Mock).mockImplementation(() =>
        Promise.resolve(mockEvent)
      );
      (Poll.create as jest.Mock).mockImplementation(() =>
        Promise.reject(new Error("Poll creation error"))
      );

      await expect(createPoll(params)).rejects.toThrow(
        "Error creating poll: Poll creation error"
      );
    });
  });

  // Add similar test cases for voteOnPoll, fetchPollById, fetchEventPoll, getPollIdByEventId, and hasUserVoted
});

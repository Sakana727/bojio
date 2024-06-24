import EventCard from "../cards/EventCard";
import { fetchCommunityEvents } from "@/lib/actions/community.actions";
import { fetchUserEvents } from "@/lib/actions/user.actions";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: "User" | "Community";
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  author: {
    name: string;
    image: string;
    id: string;
  };
  community: {
    name: string;
    id: string;
    image: string;
  };
  createdAt: string;
  children: any[]; // Adjust as per the structure of your comments
}

interface Result {
  name: string;
  image: string;
  id: string;
  events: Event[];
}

async function EventsTab({ currentUserId, accountId, accountType }: Props) {
  let result: Result;

  try {
    if (accountType === "Community") {
      result = await fetchCommunityEvents(accountId);
    } else {
      result = await fetchUserEvents(accountId);
    }

    if (!result || !result.events || result.events.length === 0) {
      console.log("No events found for account:", accountId);
      return (
        <div>
          No events found for this {accountType.toLowerCase()}.
          {/* Optionally, add a button or link to redirect */}
        </div>
      );
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    // Handle error state, possibly show an error message or redirect
    return <div>Error fetching events. Please try again later.</div>;
  }

  // console.log("Fetched Result:", result);

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.events
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .map((event) => (
          <EventCard
            key={event._id}
            id={event._id}
            currentUserId={currentUserId}
            parentId={null}
            title={event.title}
            description={event.description}
            date={event.date}
            location={event.location}
            image={event.image}
            author={event.author}
            community={
              accountType === "Community"
                ? { name: result.name, id: result.id, image: result.image }
                : event.community
            }
            createdAt={event.createdAt}
            comments={event.children}
          />
        ))}
    </section>
  );
}

export default EventsTab;

// Import necessary modules
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import PostPoll from "@/components/forms/PostPoll";
import { fetchEventById } from "@/lib/actions/event.actions"; // Assuming this is where fetchEventById is defined

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) {
    redirect("/onboarding");
  }

  if (!params || !params.id) {
    console.error("No event ID provided");
    return null;
  }

  const eventId = params.id;

  const event = await fetchEventById(eventId);
  if (!event) {
    console.error(`Event with ID ${eventId} not found`);
    return null;
  }

  return (
    <>
      <h1 className="head-text">Create New Poll</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Share Your Question with Others
      </p>
      <section className="mt-2 bg-dark-2 p-8">
        {/* Pass userId and eventId directly */}
        <PostPoll userId={user.id} eventId={eventId} />
      </section>
    </>
  );
}

export default Page;

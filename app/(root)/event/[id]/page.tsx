// Page component where ResultCard and Poll are used
import EventCard from "@/components/cards/EventCard";

import EventComment from "@/components/forms/EventComment";
import { fetchEventById } from "@/lib/actions/event.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Poll from "@/components/forms/Poll";
import { getPollIdByEventId, hasUserVoted } from "@/lib/actions/poll.actions";
import PollCard from "@/components/cards/PollCard";
import BojioCard from "@/components/cards/BojioCard";

const Page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const event = await fetchEventById(params.id);
  if (!event) return null;

  const pollId = await getPollIdByEventId(params.id);

  const voted = await hasUserVoted(pollId, userInfo._id);

  return (
    <section className="relative">
      <div>
        <EventCard
          key={event._id}
          id={event._id}
          currentUserId={user?.id || ""}
          parentId={event.parentId}
          title={event.title}
          description={event.description}
          date={event.date}
          location={event.location}
          image={event.image}
          author={event.author}
          community={event.community}
          createdAt={event.createdAt}
          comments={event.children}
        />
      </div>
      <div className="">
        <BojioCard eventId={event._id} />
      </div>
      <div className="">
        {pollId ? (
          voted ? (
            <div className="mt-2 text-white flex-row">
              <PollCard pollId={pollId} />
            </div>
          ) : (
            <div className="mt-2 text-white flex-row">
              <Poll
                eventId={event._id}
                pollId={pollId}
                currentUserId={userInfo._id}
              />
            </div>
          )
        ) : (
          <p></p>
        )}
      </div>
      <div className="mt-5">
        <EventComment
          eventId={event._id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>

      <div className="mt-10">
        {event.children.map((childItem: any) => (
          <EventCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={user.id}
            parentId={childItem.parentId}
            title={childItem.title}
            description={childItem.description}
            date={childItem.date}
            location={childItem.location}
            image={childItem.image}
            author={childItem.author}
            community={childItem.community}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment
          />
        ))}
      </div>
    </section>
  );
};

export default Page;

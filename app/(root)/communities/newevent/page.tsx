import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import EventForm from "@/components/forms/PostEvent";

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const userData = {
    id: user.id,
    objectId: userInfo?._id,
    username: userInfo ? userInfo?.username : user.username,
    name: userInfo ? userInfo?.name : user.firstName ?? "",
    bio: userInfo ? userInfo?.bio : "",
    image: userInfo ? userInfo?.image : user.imageUrl,
  };

  return (
    <>
      <h1 className="head-text">Create New Event</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Create Your Next Gathering
      </p>
      <section className="mt-2 bg-dark-2 p-8">
        <EventForm userId={userData.id} btnTitle="Create Event" />
      </section>
    </>
  );
}

export default Page;

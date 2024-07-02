import {
  fetchUser,
  getActivity,
  getEventActivity,
} from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const page = async () => {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  // Fetch activities for both posts and events
  const postActivity = await getActivity(userInfo._id);
  const eventActivity = await getEventActivity(userInfo._id);

  // Combine activities
  const combinedActivity = [...postActivity, ...eventActivity];

  // Sort activities by createdAt field in descending order
  combinedActivity.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <section>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: 20,
        }}
      >
        <h1 className="head-text text-left">Activity</h1>
      </header>
      <section className="mt-10 flex flex-col gap-5">
        {combinedActivity.length > 0 ? (
          <>
            {combinedActivity.map((activity: any) => (
              <Link
                key={activity._id}
                href={
                  activity.type === "comment"
                    ? `/post/${activity.parentId}`
                    : `/event/${activity._id}`
                }
              >
                <article className="activity-card">
                  <Image
                    src={activity.author.image}
                    alt="Profile Picture"
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                  <p className="!text-small-regular text-light-1">
                    <span className="mr-1 text-primary-500 text-small-semibold">
                      {activity.author.name}
                    </span>
                    {activity.type === "comment"
                      ? "replied to your Post"
                      : "replied to your Event"}
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className="!text-base-regular text-light-3">No activity</p>
        )}
      </section>
    </section>
  );
};

export default page;

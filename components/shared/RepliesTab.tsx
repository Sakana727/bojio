import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const RepliesTab = async () => {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const activity = await getActivity(userInfo._id);
  return (
    <div>
      <section className=" mt-10 flex flex-col gap-5">
        {activity.length > 0 ? (
          <>
            {activity.map((activity) => (
              <Link key={activity._id} href={`/post/${activity.parentId}`}>
                <article className=" activity-card">
                  <Image
                    src={activity.author.image}
                    alt=" Profile Picture"
                    width={20}
                    height={20}
                    className=" rounded-full object-cover"
                  />
                  <p className=" !text-small-regular text-light-1">
                    <span className=" mr-1 text-primary-500 text-small-semibold">
                      {activity.author.name}
                    </span>{" "}
                    replied to your Post
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className=" !text-base-regular text-light-3"> No activity</p>
        )}
      </section>
    </div>
  );
};
export default RepliesTab;

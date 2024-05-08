import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs/server";

async function Page() {
  const user = await currentUser();

  const userInfo = {};

  const userData = {
    id: user?.id,
    objectId: userInfo?._id,
    username: userInfo?.username || user?.username,
    name: (userInfo?.name || user.firstName) ?? "",
    bio: userInfo?.bio || "",
    image: userInfo?.image || user.imageUrl,
  };

  return (
    <main className="flex max-w-xl flex-col justify-start">
      <h1 className="head-text">Onboarding</h1>
      <p className="text-base-regular text-light-2">
        Complete your profile now, to use Bojio.
      </p>

      <section className="mt-2 bg-dark-2 p-8">
        <AccountProfile user={userData} btnTitle="Continue" />
      </section>
    </main>
  );
}

export default Page;

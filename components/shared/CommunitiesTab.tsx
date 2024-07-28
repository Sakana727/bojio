import { fetchUser } from "@/lib/actions/user.actions";
import { fetchCommunities } from "@/lib/actions/community.actions";
import { currentUser } from "@clerk/nextjs/server";
import CommunityCard from "@/components/cards/CommunityCard";
import Pagination from "@/components/shared/Pagination";

async function CommunitiesTab({ userInfo }: { userInfo: any }) {
  const user = await currentUser();
  if (!user) return null;

  const result = await fetchCommunities({
    searchString: "", // No search string needed
    pageNumber: 1, // Always fetch the first page
    pageSize: 25, // Fixed page size
  });

  return (
    <>
      <section className="mt-12 flex flex-wrap gap-4 justify-center">
        {result.communities.filter((community) =>
          community.members.some((member: any) => member.id === user.id)
        ).length === 0 ? (
          <p className="no-result">No Result</p>
        ) : (
          result.communities
            .filter((community) =>
              community.members.some((member: any) => member.id === userInfo.id)
            )
            .map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                bio={community.bio}
                members={community.members}
              />
            ))
        )}
      </section>

      <Pagination
        path="communities"
        pageNumber={1} // Always pass page number as 1
        isNext={result.isNext}
      />
    </>
  );
}

export default CommunitiesTab;

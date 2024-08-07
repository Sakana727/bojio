import { formatDateString } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import BojioButton from "../forms/Bojio";
import DeleteEvent from "../forms/DeleteEvent";
import { EditEventDialog } from "../forms/EditEventDialog";
import EventDropdown from "../shared/EventDropdown";
import { ShareBtn } from "../forms/EventShare";
import { LikeBtnSimple } from "../forms/like";
// import DeleteEvent from "../forms/DeleteEvent";

interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
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
    id: string;
    name: string;
    image: string;
  };
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean;
}

const EventCard = ({
  id,
  currentUserId,
  parentId,
  title,
  description,
  date,
  location,
  image,
  author,
  community,
  createdAt,
  comments,
  isComment,
}: Props) => {
  return (
    <article
      className={`flex w-full flex-col rounded-xl ${
        isComment ? "px-0 xs:px-7" : "bg-dark-2 p-7"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
              <Image
                src={author.image}
                alt="Profile image"
                fill
                sizes="auto"
                className="cursor-pointer rounded-full"
              />
            </Link>
            <div className="post-card_bar" />
          </div>
          <div className="flex w-full flex-col">
            <Link href={`/profile/${author.id}`} className="w-fit">
              <h4 className="cursor-pointer text-base-semibold text-light-1">
                {author.name}
              </h4>
            </Link>

            <h5
              className={` mt-2 text-lg text-light-1 ${
                isComment ? " font-normal" : " font-semibold"
              }`}
            >
              {title}
            </h5>

            <div>
              {!isComment && image && (
                <p className="event_details-img my-4">
                  <div className="relative h-full w-full">
                    <Image
                      src={image}
                      alt="Event Image"
                      fill
                      className="rounded-md object-scale-down w-full"
                    />
                  </div>
                </p>
              )}
              {!isComment && !parentId && (
                <div>
                  <p className="mt-2 text-small-regular text-light-2">
                    {description}
                  </p>
                  <p className="mt-1 text-small-regular text-light-2">
                    Date: {formatDateString(date)}
                  </p>
                  <p className="mt-1 text-small-regular text-light-2">
                    Location: {location}
                  </p>
                </div>
              )}
            </div>

            <div className={`${isComment && "mb-10"} mt-5 flex flex-col gap-3`}>
              <div className="flex gap-3.5">
                <LikeBtnSimple />
                <Link href={`/event/${id}`}>
                  <Image
                    src="/assets/reply.svg"
                    alt="reply"
                    width={24}
                    height={24}
                    className="cursor-pointer object-contain"
                  />
                </Link>
                <ShareBtn title={title} text={description} EventId={id} />
                {!isComment && !parentId && (
                  <Link href={`/poll/${id}`}>
                    <Image
                      src="/assets/poll.svg"
                      alt="poll"
                      width={24}
                      height={24}
                      className="cursor-pointer object-contain"
                    />
                  </Link>
                )}

                {!isComment && !parentId && (
                  <BojioButton eventId={id} userId={currentUserId} />
                )}
              </div>
              {isComment && comments.length > 0 && (
                <Link href={`/event/${id}`}>
                  <p className="mt-1 text-subtle-medium text-gray-1">
                    {comments.length} repl{comments.length > 1 ? "ies" : "y"}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>
        {/* <div>
          <DeleteEvent
            eventId={id}
            currentUserId={currentUserId}
            authorId={author.id}
          />
        </div>
        <div>
          <EditEventDialog
            eventId={id}
            title={title}
            description={description}
            date={date}
            location={location}
            image={image}
            author={author.id}
            communityId={community.id}
            path={""}
            currentUserId={currentUserId}
          />
        </div> */}
        <div>
          {!isComment && (
            <EventDropdown
              id={id}
              title={title}
              description={description}
              date={date}
              location={location}
              image={image}
              authorId={author.id}
              communityId={community?.id}
              currentUserId={currentUserId}
            />
          )}
        </div>
      </div>
      {!isComment && comments.length > 0 && (
        <div className="ml-1 mt-3 flex items-center gap-2">
          {comments.slice(0, 2).map((comment, index) => (
            <Image
              key={index}
              src={author.image}
              alt={`user_${index}`}
              width={24}
              height={24}
              className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
            />
          ))}
          <Link href={`/event/${id}`}>
            <p className="mt-1 text-subtle-medium text-gray-1">
              {comments.length} repl{comments.length > 1 ? "ies" : "y"}
            </p>
          </Link>
        </div>
      )}

      {!isComment && community && (
        <Link
          href={`/communities/${community.id}`}
          className="mt-5 flex items-center"
        >
          <p className=" text-subtle-medium text-gray-1">
            {formatDateString(createdAt)}
            {community && ` - ${community.name} Community`}
          </p>

          <Image
            src={community.image}
            alt={community.name}
            width={14}
            height={14}
            className=" ml-1 rounded-full object-cover"
          />
        </Link>
      )}
    </article>
  );
};

export default EventCard;

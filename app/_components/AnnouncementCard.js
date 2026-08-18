"use client";
import { format } from "date-fns";
import { Calendar, Ellipsis, Pin } from "lucide-react";
import AnnouncementDropdownMenu from "./AnnouncementDropdownMenu";
import TriggerButton from "./TriggerButton";
import { useUser } from "@/contexts/UserContext";

function AnnouncementCard({ announcement, categories = null }) {
  const {
    id: announcementId,
    author_id,
    role,
    title,
    content,
    is_pinned,
    created_at,
    updated_at,
    category,
    color,
    text_color,
    first_name,
    last_name,
  } = announcement;

  const { user } = useUser();
  const userId = user.id;
  const userRole = user.role;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 w-full justify-between">
        <div className="flex gap-2">
          <h3 className="flex items-center font-bold gap-2 text-sm">
            {is_pinned ? (
              <span className="text-primary-500">
                <Pin className="h-5 w-5" />
              </span>
            ) : null}
            <span className="font-medium text-stone-500">Title: </span>
            {title}
          </h3>
          <span
            className={`text-xs tracking-wider h-fit px-1.5 py-0.5 rounded-full font-bold`}
            style={{ backgroundColor: color, color: text_color }}
          >
            {category}
          </span>
        </div>

        {userId === author_id || userRole === "admin" ? (
          <AnnouncementDropdownMenu
            trigger={
              <TriggerButton
                icon={<Ellipsis className="h-5 w-5" />}
                type="mini"
                className="hover:bg-stone-100 rounded-full transition-colors"
              />
            }
            userId={userId === author_id}
            announcementId={announcementId}
            is_pinned={is_pinned}
            data={announcement}
            categories={categories}
          />
        ) : null}
      </div>

      <p className="text-stone-500">{content}</p>

      <div className="flex flex-col text-stone-500 text-xs gap-2 mt-2">
        <div className="flex gap-1 items-center">
          <span>Posted by</span>
          <span className="text-stone-800 font-bold tracking-wider">
            {first_name} {last_name}
          </span>
          <span className="bg-primary-500 text-white text-[10px] font-medium tracking-wider px-1.5 py-0.5 rounded-full">
            {role === "admin" && "Admin"}
            {role === "department_head" && "Department Head"}
          </span>
        </div>

        <div className="flex gap-1 items-center ">
          <span>
            <Calendar className="h-4 w-4" />
          </span>
          {format(new Date(created_at), "MMMM dd, yyyy")}.
        </div>
      </div>
    </div>
  );
}

export default AnnouncementCard;

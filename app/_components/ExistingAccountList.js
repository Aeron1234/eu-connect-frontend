import {
  Briefcase,
  Crown,
  GraduationCap,
  ShieldBan,
  ShieldMinus,
  Trash2,
} from "lucide-react";
import Modal from "./Modal";
import DeactivateAccount from "./DeactivateAccount";
import ReactivateAccount from "./ReactivateAccount";
import { format } from "date-fns";

function ExistingAccountList({ filteredAccounts }) {
  return (
    <ul className="flex-1 flex flex-col gap-2 mt-4">
      {filteredAccounts &&
        filteredAccounts.map((account) => (
          <li
            key={account.id}
            className={`flex-1 ${account.status === "inactive" ? "opacity-40 hover:opacity-100" : ""} transition-all`}
          >
            <ExistingAccountListItem accountDetails={account} />
          </li>
        ))}
      {!filteredAccounts.length && (
        <li className="flex-1 flex justify-center text-stone-600 mt-4w">
          <p className="">No result.</p>
        </li>
      )}
    </ul>
  );
}

function ExistingAccountListItem({ accountDetails }) {
  const {
    id,
    first_name,
    last_name,
    role,
    email,
    course_name,
    status,
    created_at,
  } = accountDetails;

  return (
    <div
      className={`grid grid-cols-[1fr_auto] gap-4 w-full p-4 border border-stone-300 rounded-sm hover:bg-stone-100 transition-colors `}
    >
      <div className="flex flex-col gap-1 w-full">
        <div className="flex gap-4">
          <h3 className="text-sm font-semibold self-end">
            {last_name}, {first_name}
          </h3>

          {role && <Tag role={role} status={status} />}
        </div>
        <p className="text-xs text-stone-500 flex flex-col ">
          <span>{email}</span>
          {course_name && <span>Dept: {course_name}</span>}
          {/* {company && <span>Company: {company}</span>} */}
          {role === "employer" && <span>Company: Jollibee</span>}
        </p>
      </div>

      <div className="flex items-center gap-2 h-full">
        <p className="text-stone-500 text-[10px] tracking-wider">
          Created: {format(new Date(created_at), "MM-dd-yyyy")}
        </p>
        {status === "active" && <DeactivateAccount id={id} />}
        {status === "inactive" && <ReactivateAccount id={id} />}
      </div>
    </div>
  );
}

function Tag({ role, status }) {
  if (role === "student")
    return (
      <div
        className={`flex items-center px-2.5 py-0.5 ${status === "active" ? "bg-blue-100 text-blue-600" : "bg-stone-200 text-stone-600"}  text-[10px] tracking-wide rounded-full gap-1 font-semibold`}
      >
        {status === "active" ? (
          <>
            <span>
              <GraduationCap className="h-4 w-4" />
            </span>
            Student
          </>
        ) : (
          <>
            <span>
              <ShieldBan className="h-4 w-4" />
            </span>
            Inactive
          </>
        )}
      </div>
    );

  if (role === "department_head")
    return (
      <div
        className={`flex items-center px-2.5 py-0.5 ${status === "active" ? "bg-purple-200 text-purple-600" : "bg-stone-200 text-stone-600"}  text-[10px] tracking-wide rounded-full gap-1 font-semibold`}
      >
        {status === "active" ? (
          <>
            <span>
              <Crown className="h-4 w-4" />
            </span>
            Dept. Head
          </>
        ) : (
          <>
            <span>
              <ShieldBan className="h-4 w-4" />
            </span>
            Inactive
          </>
        )}
      </div>
    );

  if (role === "employer")
    return (
      <div
        className={`flex items-center px-2.5 py-0.5 ${status === "active" ? " bg-green-100 text-green-600" : "bg-stone-200 text-stone-600"} text-[10px] tracking-wide rounded-full gap-1 font-semibold`}
      >
        {status === "active" ? (
          <>
            <span>
              <Briefcase className="h-4 w-4" />
            </span>
            Employer
          </>
        ) : (
          <>
            <span>
              <ShieldBan className="h-4 w-4" />
            </span>
            Inactive
          </>
        )}
      </div>
    );
}

export default ExistingAccountList;

// import CalendarUi from "@/app/_components/Calendar";
// import HoursProgressDonut from "@/app/_components/HoursProgressDonut";
// import { ChevronLeft, ChevronRight, Ellipsis, Plus } from "lucide-react";
// import { Button } from "components/ui/button";
// import PageTitle from "app/_components/PageTitle";
// import PageContainer from "app/_components/PageContainer";
// import { notFound } from "next/navigation";
// import { auth } from "@/app/_services/auth";
// import Dtr from "../_components/Dtr";
// import { Suspense } from "react";
// import { Spinner } from "@/components/ui/spinner";
// import InternshipRecordButton from "../_components/InternshipRecordButton";

// export const metadata = {
//   title: "Student",
// };

// async function StudentPage() {
//   const session = await auth();
//   if (!session?.user) return notFound();

//   const role = session.user.role;
//   if (role !== "student") return notFound();

//   // const internshipData = (await getOngoingInternshipRecord()) ?? {
//   //   status: "idle",
//   // };

//   // const isOngoing = internshipData.status === "ongoing";

//   return (
//     <PageContainer>
//       <PageTitle title="Welcome back, Student!">
//         <InternshipRecordButton />
//       </PageTitle>

//       <div className="flex gap-4 h-full">
//         <div className="flex-1 gap-4 flex flex-col h-full max-h-screen">
//           <div className="bg-white rounded-md p-4 shadow-sm flex flex-col gap-4">
//             <Suspense
//               fallback={
//                 <div className="self-center justify-self-center p-5">
//                   <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
//                 </div>
//               }
//             >
//               <Dtr />
//             </Suspense>
//           </div>

//           <div className="bg-white rounded-md p-4 shadow-sm flex flex-col gap-4 h-full">
//             <header className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-semibold text-stone-700">
//                   Narrative Report
//                 </h2>
//                 <p className="text-stone-500">
//                   Post your daily narratives here
//                 </p>
//               </div>

//               <Button
//                 className={
//                   "bg-primary-500 hover:bg-primary-400 cursor-pointer rounded-md"
//                 }
//               >
//                 <Plus /> <span>Post</span>
//               </Button>
//             </header>

//             <ul className="flex-1 border border-stone-200 grid grid-cols-3">
//               <li className="border-r border-stone-200 p-2">
//                 <h3 className="font-bold">Day 1</h3>
//                 <p>
//                   Lorem Ipsum is simply dummy text of the printing and
//                   typesetting industry. Lorem Ipsum has been the industry&apos;s
//                   standard dummy text ever since the 1500s.
//                 </p>
//               </li>
//               <li className="border-r border-stone-200 p-2">
//                 <h3 className="font-bold">Day 2</h3>
//                 <p>
//                   Lorem Ipsum is simply dummy text of the printing and
//                   typesetting industry. Lorem Ipsum has been the industry&apos;s
//                   standard dummy text ever since the 1500s.
//                 </p>
//               </li>
//               <li className="border-r border-stone-200 p-2 last:border-0">
//                 <h3 className="font-bold">Day 3</h3>
//                 <p>
//                   Lorem Ipsum is simply dummy text of the printing and
//                   typesetting industry. Lorem Ipsum has been the industry&apos;s
//                   standard dummy text ever since the 1500s.
//                 </p>
//               </li>
//             </ul>

//             <ul className="flex items-center justify-center gap-4 font-semibold px-4 py-2">
//               <li>
//                 <ChevronLeft size={16} />
//               </li>
//               <li>1</li>
//               <li>2</li>
//               <li>3</li>
//               <li>
//                 <Ellipsis size={16} />
//               </li>
//               <li>
//                 <ChevronRight size={16} />
//               </li>
//             </ul>
//           </div>
//         </div>
//         {/* <div className="hidden xl:flex flex-row xl:flex-col gap-4 h-fit"> */}
//         <div className="flex max-lg:hidden flex-col gap-4 h-fit">
//           <div className="items-center flex">
//             <CalendarUi />
//           </div>

//           <div className="flex-1">
//             <HoursProgressDonut />
//           </div>
//         </div>
//       </div>
//     </PageContainer>
//   );
// }

// export default StudentPage;

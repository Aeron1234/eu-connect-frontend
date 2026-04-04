import { DialogClose } from "@/components/ui/dialog";
import Modal from "./Modal";

function CompanyAddressSearchItems({
  data,
  internshipForm,
  setInternshipForm,
  onClick,
}) {
  if (!data) return;
  console.log(data);
  return (
    <li
      className="p-2 border-b border-stone-300 flex flex-col gap-1 last:border-b-0 hover:bg-stone-100 cursor-pointer transition-colors"
      onClick={() =>
        onClick({
          display_name: data.display_name,
          address_lat: data.lat,
          address_lon: data.lon,
        })
      }
    >
      <h3 className="font-semibold">{data.display_place}</h3>
      <p className="text-stone-500 text-xs">{data.display_name}</p>
    </li>
  );
}

export default CompanyAddressSearchItems;

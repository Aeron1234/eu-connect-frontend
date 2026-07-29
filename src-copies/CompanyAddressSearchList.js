"use client";

import { Spinner } from "@/components/ui/spinner";
import { useApiFetch } from "../_services/helpers";
import CompanyAddressSearchItems from "./CompanyAddressSearchItems";

function CompanyAddressSearchList({
  internshipForm,
  setInternshipForm,
  selectedAddress,
  setSelectedAddress,
}) {
  const isDuplicate = selectedAddress === internshipForm.company_address;
  const url =
    internshipForm.company_address.length >= 3 && !isDuplicate
      ? `api/geocode?q=${encodeURIComponent(internshipForm.company_address)}`
      : null;

  const { data: addressData, loading, error, setData } = useApiFetch(url, 600);

  function handleClick({ display_name, address_lat, address_lon }) {
    setInternshipForm({
      ...internshipForm,
      company_address: display_name,
      lat: address_lat,
      lon: address_lon,
    });
    setData(null);
    console.log(internshipForm);

    setSelectedAddress(display_name);
  }

  return (
    <ul className="absolute w-full z-10 bg-white rounded-sm shadow-lg">
      {loading ? (
        <li className="w-full px-3 py-1 flex items-center justify-center">
          Searching...
        </li>
      ) : addressData ? (
        addressData?.map((item, i) => (
          <CompanyAddressSearchItems
            data={item}
            internshipForm={internshipForm}
            setInternshipForm={setInternshipForm}
            onClick={handleClick}
            key={i}
          />
        ))
      ) : null}
    </ul>
  );
}

export default CompanyAddressSearchList;

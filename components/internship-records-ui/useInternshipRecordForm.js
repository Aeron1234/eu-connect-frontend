"use client";

import { useState, useTransition } from "react";
import { createInternshipRecord } from "@/lib/server-actions/internship-records-actions";
import { toastAndAction } from "@/lib/helpers";

export default function useInternshipRecordForm(recordStatus, onCreated) {
  const status = recordStatus === "pending" || recordStatus === "ongoing";

  const [showForm, setShowForm] = useState(!status);
  const [internshipForm, setInternshipForm] = useState({
    company_name: "",
    company_address: "",
    internship_position: "",
    company_website: "",
    description: "",
    date_started: "",
    date_ended: "",
    total_hours: "",
    semester: "",
    lat: "",
    lon: "",
  });
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    formData.append("company_address", internshipForm.company_address);
    formData.append("lat", internshipForm.lat);
    formData.append("lon", internshipForm.lon);

    const handlers = {
      loadingLabel: "Creating internship record...",
      successLabel: "Good luck on your internship!",
      errorLabel: "Creating internship record failed.",
      action: createInternshipRecord,
      args: [formData],
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);

      if (result?.success) {
        onCreated?.();
        setInternshipForm({
          company_name: "",
          company_address: "",
          internship_position: "",
          company_website: "",
          description: "",
          date_started: "",
          date_ended: "",
          total_hours: "",
          semester: "",
          lat: "",
          lon: "",
        });
        setSelectedRegion("");
      }
    });
  }

  return {
    status, showForm, setShowForm, isPending, handleAction,
    fieldProps: { internshipForm, setInternshipForm, isPending, status },
    regionProps: { selectedRegion, setSelectedRegion },
  };
}

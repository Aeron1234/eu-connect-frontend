"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Lock,
  Pencil,
  User,
  X,
  Check,
  GraduationCap,
  Building2,
  Shield,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const CARD_ICONS = {
  "Personal Information": User,
  "Academic Overview": GraduationCap,
  "Department Background": GraduationCap,
  "Company Background": Building2,
  "Account Status": Shield,
};

function displayValue(v) {
  return v === null || v === undefined || v === "" ? "—" : v;
}

function buildName(userData) {
  if (!userData?.first_name && !userData?.last_name) return "—";
  return `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim();
}

function buildSubtitle(role, userData) {
  switch (role) {
    case "student":
      return [
        userData.year_level &&
          `${userData.year_level} ${userData.course ?? ""} Student`,
        userData.student_number && `Student ID: ${userData.student_number}`,
      ]
        .filter(Boolean)
        .join(" • ");
    case "employer":
      return [userData.position, userData.company_name]
        .filter(Boolean)
        .join(" • ");
    case "department_head":
      return [
        "Department Head",
        userData.department_name ?? userData.department_code,
      ]
        .filter(Boolean)
        .join(" • ");
    case "admin":
      return "System Administrator • EU-Connect";
    default:
      return "";
  }
}

function buildCards(role, userData) {
  const personalCard = {
    title: "Personal Information",
    fields: [
      { label: "Email Address", value: displayValue(userData.email) },
      { label: "Contact Number", value: displayValue(userData.contact_number) },
      { label: "Full Address", value: displayValue(userData.full_address) },
    ],
  };

  switch (role) {
    case "student":
      return [
        personalCard,
        {
          title: "Academic Overview",
          fields: [
            { label: "Course", value: displayValue(userData.course) },
            {
              label: "Department",
              value: displayValue(
                userData.department_name
                  ? `${userData.department_name} (${userData.department_code})`
                  : userData.department_code,
              ),
            },
            {
              label: "Student Number",
              value: displayValue(userData.student_number),
            },
            { label: "Year Level", value: displayValue(userData.year_level) },
          ],
        },
      ];
    case "employer":
      return [
        personalCard,
        {
          title: "Company Background",
          fields: [
            {
              label: "Company Name",
              value: displayValue(userData.company_name),
            },
            { label: "Position", value: displayValue(userData.position) },
            {
              label: "Company Contact",
              value: displayValue(userData.company_contact_number),
            },
            {
              label: "Company Address",
              value: displayValue(userData.company_address),
            },
          ],
        },
      ];
    case "department_head":
      return [
        personalCard,
        {
          title: "Department Background",
          fields: [
            {
              label: "Department",
              value: displayValue(
                userData.department_name
                  ? `${userData.department_name} (${userData.department_code})`
                  : userData.department_code,
              ),
            },
            {
              label: "Employee Number",
              value: displayValue(userData.employee_number),
            },
          ],
        },
      ];
    case "admin":
      return [
        personalCard,
        {
          title: "Account Status",
          fields: [
            { label: "Role", value: "Administrator" },
            {
              label: "Status",
              value:
                userData.status?.charAt(0).toUpperCase() +
                  userData.status?.slice(1) || "—",
            },
            {
              label: "Member Since",
              value: userData.created_at
                ? format(new Date(userData.created_at), "MMMM yyyy")
                : "—",
            },
          ],
        },
      ];
    default:
      return [personalCard];
  }
}

export default function AccountProfile({
  role,
  roleLabel,
  userData = {},
  extras = {},
}) {
  const { internship, history, roster } = extras;

  const initialName = buildName(userData);
  const initialCards = buildCards(role, userData);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [cardsData, setCardsData] = useState(() =>
    initialCards.map((card) => ({
      ...card,
      fields: card.fields.map((f) => ({ ...f })),
    })),
  );

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const isNameEditable = role !== "student";

  const resetToOriginal = () => {
    setName(initialName);
    setCardsData(
      initialCards.map((card) => ({
        ...card,
        fields: card.fields.map((f) => ({ ...f })),
      })),
    );
  };

  const handleFieldChange = (cardIndex, fieldIndex, value) => {
    setCardsData((prev) => {
      const next = [...prev];
      next[cardIndex] = {
        ...next[cardIndex],
        fields: next[cardIndex].fields.map((f, i) =>
          i === fieldIndex ? { ...f, value } : f,
        ),
      };
      return next;
    });
  };

  const handleSave = () => {
    // TODO: send `name` + `cardsData` (flatten fields back into your API's expected shape) to your API
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetToOriginal();
    setIsEditing(false);
  };

  const resetPasswordFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handlePasswordUpdate = () => {
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    // TODO: send { currentPassword, newPassword } to your API
    resetPasswordFields();
    setIsChangingPassword(false);
  };

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary-500 mb-4 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2">
            <User className="w-7 h-7 text-primary-500" />
            My Account
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            View and manage your profile details, records, and security
            settings.
          </p>
        </div>

        <div className="flex justify-end">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition"
            >
              <Pencil className="h-4 w-4" />
              <span className="text-sm font-semibold">Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 border border-border px-4 py-2.5 rounded-md text-sm font-semibold text-foreground hover:bg-secondary transition"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition"
              >
                <Check className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <div className="h-24 bg-primary-500" />
          <div className="flex flex-wrap items-end justify-between gap-4 px-6 pb-6">
            <div className="flex items-end gap-5">
              <div className="-mt-10 flex h-24 w-24 items-center justify-center rounded-xl border-4 border-background bg-secondary">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="pb-1">
                {isEditing && isNameEditable ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="font-display text-2xl font-bold rounded-md border border-border bg-background px-2 py-1 w-full max-w-xs"
                  />
                ) : (
                  <h2 className="font-display text-2xl font-bold">{name}</h2>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  {buildSubtitle(role, userData)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {cardsData.map((card, cardIndex) => {
                const Icon = CARD_ICONS[card.title] ?? User;
                return (
                  <section
                    key={card.title}
                    className="rounded-xl border border-border bg-background p-6 shadow-sm"
                  >
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-500">
                      <Icon className="h-4 w-4" /> {card.title}
                    </h3>
                    <dl className="mt-5 space-y-4">
                      {card.fields.map((f, fieldIndex) => (
                        <div key={f.label}>
                          <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                            {f.label}
                          </dt>
                          {isEditing ? (
                            <input
                              type="text"
                              value={f.value}
                              onChange={(e) =>
                                handleFieldChange(
                                  cardIndex,
                                  fieldIndex,
                                  e.target.value,
                                )
                              }
                              className="mt-1 w-full text-sm text-foreground rounded-md border border-border bg-background px-2 py-1.5"
                            />
                          ) : (
                            <dd className="mt-1 text-sm text-foreground">
                              {f.value}
                            </dd>
                          )}
                        </div>
                      ))}
                    </dl>
                  </section>
                );
              })}
            </div>

            {history && (
              <section className="rounded-xl border border-border bg-background shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-500">
                    Internship History
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {history.length} Total Records
                  </span>
                </div>
                <div className="space-y-5 p-6">
                  {history.map((h) => (
                    <article key={h.company}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold">{h.company}</h4>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {h.meta}
                          </p>
                        </div>
                        <span className="rounded-md border border-border px-3 py-1 text-xs font-semibold">
                          {h.score}
                        </span>
                      </div>
                      <div className="mt-4 rounded-lg bg-secondary/70 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                          Evaluation Details
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                          {h.ratings.map((r) => (
                            <div key={r.label}>
                              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                                {r.label}
                              </p>
                              <p className="mt-1 text-lg font-semibold">
                                {r.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {roster && (
              <section className="rounded-xl border border-border bg-background shadow-sm">
                <div className="border-b border-border px-6 py-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-500">
                    {roster.title}
                  </h3>
                </div>
                <ul className="divide-y divide-border">
                  {roster.rows.map((row) => (
                    <li
                      key={row.primary}
                      className="flex items-center justify-between px-6 py-4"
                    >
                      <div>
                        <p className="text-sm font-semibold">{row.primary}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {row.secondary}
                        </p>
                      </div>
                      <span className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                        {row.tag}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            {internship && (
              <section className="rounded-xl bg-primary-500 p-6 text-primary-foreground shadow-sm">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
                  <span className="h-2 w-2 rounded-full bg-primary-foreground/70" />{" "}
                  Active Internship
                </p>
                <h3 className="mt-4 font-display text-xl font-bold">
                  {internship.company}
                </h3>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  {internship.position}
                </p>
                <div className="mt-5 border-t border-primary-foreground/20 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-primary-foreground/80">
                      Completion
                    </span>
                    <span className="font-semibold">
                      {internship.completion}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/20">
                    <div
                      className="h-full rounded-full bg-primary-foreground"
                      style={{ width: `${internship.completion}%` }}
                    />
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-xl border border-border bg-background p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                Security
              </h3>

              <div className="mt-4 rounded-lg bg-secondary/70 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-muted-foreground" /> Password
                  </span>
                  {!isChangingPassword ? (
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(true)}
                      className="text-xs font-semibold text-primary-500 hover:underline"
                    >
                      Update
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        resetPasswordFields();
                        setIsChangingPassword(false);
                      }}
                      className="text-xs font-semibold text-muted-foreground hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {isChangingPassword && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                    />

                    {passwordError && (
                      <p className="text-xs font-medium text-red-500">
                        {passwordError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handlePasswordUpdate}
                      className="w-full rounded-md bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Save New Password
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Last changed 3 months ago. We recommend changing it
                periodically.
              </p>
            </section>

            <section className="rounded-xl border border-border bg-background p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                Account
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="font-medium">{roleLabel}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium text-primary-500">
                    {userData.status
                      ? userData.status.charAt(0).toUpperCase() +
                        userData.status.slice(1)
                      : "Active"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="max-w-[60%] truncate font-medium">
                    {displayValue(userData.email)}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

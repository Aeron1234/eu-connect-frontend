"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { labelClass, inputClass, selectTriggerClass } from "./accountFormStyles";

export default function AccountIdentityFields({
  accountForm, setAccountForm, isPending, roles,
  selectedRole, setSelectedRole, formatRolesForSelect,
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 items-start">
      <div>
        <label htmlFor="first_name" className={labelClass}>
          First Name *
        </label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          placeholder="Juan"
          className={inputClass}
          value={accountForm.first_name}
          onChange={(e) =>
            setAccountForm((prev) => ({
              ...prev,
              first_name: e.target.value,
            }))
          }
          disabled={isPending}
          required
        />
      </div>

      <div>
        <label htmlFor="middle_initial" className={labelClass}>
          Middle Initial (optional)
        </label>
        <input
          type="text"
          id="middle_initial"
          name="middle_initial"
          placeholder="A"
          className={inputClass}
          maxLength={2}
          pattern="[A-Za-z][.]?"
          title="Enter one letter, optionally followed by a period."
          value={accountForm.middle_initial}
          onChange={(e) => setAccountForm((prev) => ({
            ...prev,
            middle_initial: e.target.value,
          }))}
          disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="last_name" className={labelClass}>
          Last Name *
        </label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          placeholder="Dela Cruz"
          className={inputClass}
          value={accountForm.last_name}
          onChange={(e) =>
            setAccountForm((prev) => ({
              ...prev,
              last_name: e.target.value,
            }))
          }
          disabled={isPending}
          required
        />
      </div>

      <div>
        <label htmlFor="role" className={labelClass}>
          Role *
        </label>

        <input
          type="hidden"
          name="role"
          value={selectedRole}
          disabled={isPending}
        />
        <Select
          value={selectedRole}
          onValueChange={setSelectedRole}
          disabled={isPending}
        >
          <SelectTrigger id="role" className={`mt-1 ${selectTriggerClass}`}>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Roles</SelectLabel>
              {roles.map((role) => (
                <SelectItem key={role.id} value={`${role.id}`}>
                  {formatRolesForSelect(role.role)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

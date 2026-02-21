import PageContainer from "./PageContainer";
import PageTitle from "./PageTitle";
import AccountHeader from "./AccountHeader";
import AccountPersonalInfo from "./AccountPersonalInfo";

function AccountAdmin() {
  return (
    <PageContainer>
      <PageTitle title={"Account"} />

      <AccountHeader
        fullName={"Roronoa Zoro"}
        department={"Computer Science"}
        email={"roronoazoro@email.com"}
      />

      <AccountPersonalInfo>
        <div className="grid grid-cols-4 gap-x-4 text-sm font-semibold px-6">
          <div className="flex flex-col gap-2">
            <Info label="First Name" info="Roronoa" />
            <Info label="Last Name" info="Zoro" />
          </div>
          <div className="flex flex-col gap-2">
            <Info label="Department" info="Computer Science" />
            <Info label="User Role" info="Admin" />
          </div>
          <div className="flex flex-col gap-2">
            <Info label="Email" info="roronoazoro@email.com" />
            <Info label="Contact No." info="09090909090" />
          </div>
          <div className="flex flex-col gap-2">
            <Info label="Town" info="Candelaria" />
            <Info label="Province/City" info="Quezon Province" />
          </div>
        </div>
      </AccountPersonalInfo>
    </PageContainer>
  );
}

function Info({ label, info }) {
  return (
    <div className="flex flex-col">
      <span className="text-stone-500 text-xs">{label}</span>
      <span>{info}</span>
    </div>
  );
}

export default AccountAdmin;

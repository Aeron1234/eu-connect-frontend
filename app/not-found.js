import ErrorUI from "@/components/ui/ErrorUI";

export default function NotFound() {
  return (
    <ErrorUI
      error={{ status: 404, message: "The page or item could not be found." }}
      logError={false}
    />
  );
}

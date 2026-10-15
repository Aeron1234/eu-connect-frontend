import {
  FileText, Megaphone, CalendarDays, CheckCircle2, XCircle, ClipboardCheck,
  Star, ClipboardX, Award, UserPlus, UserCheck, UserX, MapPin,
} from "lucide-react";

const NOTIFICATION_TYPES = {
  announcement: { icon: Megaphone, label: "Announcement", tone: "primary" },
  calendar_schedule: { icon: CalendarDays, label: "Calendar schedule", tone: "success" },
  internship_record_request: { icon: FileText, label: "Internship request", tone: "primary" },
  internship_record_approved: { icon: CheckCircle2, label: "Internship update", tone: "success" },
  internship_record_rejected: { icon: XCircle, label: "Internship update", tone: "destructive" },
  internship_record_finished: { icon: CheckCircle2, label: "Internship update", tone: "success" },
  internship_record_force_finished: { icon: CheckCircle2, label: "Internship update", tone: "success" },
  evaluation_submitted: { icon: ClipboardCheck, dropdownIcon: Star, label: "Evaluation", tone: "primary" },
  evaluation_deleted: { icon: ClipboardX, label: "Evaluation", tone: "muted" },
  certificate_uploaded: { icon: Award, label: "Document", tone: "success" },
  certificate_accepted: { icon: CheckCircle2, label: "Document", tone: "success" },
  certificate_rejected: { icon: ClipboardX, label: "Document", tone: "destructive" },
  supervisor_request_submitted: { icon: UserPlus, label: "Supervisor request", tone: "primary" },
  supervisor_request_accepted: { icon: UserCheck, label: "Supervisor request", tone: "success" },
  supervisor_request_rejected: { icon: UserX, label: "Supervisor request", tone: "destructive" },
  dtr_location_set: { icon: MapPin, label: "DTR location", tone: "primary" },
};

export const TONE_STYLES = {
  primary: "bg-primary/10 text-primary-emphasis",
  success: "bg-emerald-50 text-emerald-600",
  destructive: "bg-red-50 text-red-600",
  muted: "bg-secondary text-muted-foreground",
};

export function getDropdownNotificationMeta(type) {
  const meta = NOTIFICATION_TYPES[type];
  return meta
    ? { icon: meta.dropdownIcon || meta.icon, label: meta.label }
    : { icon: FileText, label: "Update" };
}

export function getNotificationItemMeta(type) {
  const meta = NOTIFICATION_TYPES[type];
  return meta
    ? { icon: meta.icon, tone: meta.tone }
    : { icon: FileText, tone: "muted" };
}

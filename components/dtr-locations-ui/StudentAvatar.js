import Image from 'next/image';

export default function StudentAvatar({ student }) {
  return <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary-emphasis">
    {student.avatar ? <Image src={`/avatars/${encodeURIComponent(student.avatar)}`} alt="" width={36} height={36} className="size-full object-cover" /> : student.name.split(' ').map(part => part[0]).slice(0, 2).join('')}
  </span>;
}

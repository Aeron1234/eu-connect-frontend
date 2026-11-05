"use client";
/* eslint-disable @next/next/no-img-element -- These small local avatars intentionally bypass image optimization. */

import { useState } from 'react';

export default function StudentAvatar({ student }) {
  const [failedAvatar, setFailedAvatar] = useState(null);
  const avatar = student.avatar && failedAvatar !== student.avatar ? student.avatar : null;
  const initials = student.name.split(' ').map(part => part[0]).slice(0, 2).join('');

  return <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary-emphasis">
    {avatar ? <img src={`/avatars/${encodeURIComponent(avatar)}`} alt="" width={36} height={36} className="size-full object-cover" onError={() => setFailedAvatar(avatar)} /> : initials}
  </span>;
}

"use client";
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/contexts/UserContext';
import { getAnnouncementTagStudents } from '@/lib/server-actions/announcements-actions';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnnouncementStudentTags({ initialIds, initialStudents, disabled, onSelectionChange }) {
  const { user } = useUser();
  const [selected, setSelected] = useState(() => {
    try { return typeof initialIds === 'string' ? JSON.parse(initialIds) || [] : initialIds || []; } catch { return []; }
  });
  const [search, setSearch] = useState(''), [term, setTerm] = useState('');
  const [names, setNames] = useState(() => {
    try { const rows = typeof initialStudents === 'string' ? JSON.parse(initialStudents) : initialStudents; return Object.fromEntries((rows || []).map(row => [row.id, row.name])); } catch { return {}; }
  });
  useEffect(() => { const timer = setTimeout(() => setTerm(search.trim()), 300); return () => clearTimeout(timer); }, [search]);
  useEffect(() => { onSelectionChange?.(selected.length); }, [selected.length, onSelectionChange]);
  const query = useQuery({ queryKey: ['announcement-tag-students', String(user.id), term], queryFn: async () => {
    const result = await getAnnouncementTagStudents(term);
    if (!result.success) throw new Error(result.error);
    return result.students;
  }, retry: false, staleTime: 0 });
  return <div className="space-y-2 rounded-lg border border-border p-3">
    <input type="hidden" name="tagged_student_ids" value={JSON.stringify(selected)} />
    <p className="text-sm font-medium">Tag students (optional)</p>
    <p className="text-xs text-muted-foreground">{user.role === 'department_head' && user.department_code !== 'REG' ? 'Select multiple ongoing students from your department.' : 'Select multiple ongoing students from any department.'} Selections stay when you search.</p>
    <p className="text-xs text-muted-foreground">With Visible to employers checked, only tagged students’ current supervisors can view this post and receive an employer notification. Without tags, it is shared with all employers. Tagging automatically restricts the school audience to tagged students, their department heads, admins and the author.</p>
    <input aria-label="Search students to tag" placeholder="Search ongoing interns…" maxLength={100} disabled={disabled} value={search} onChange={event => setSearch(event.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
    {selected.length > 0 && <ul className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">{selected.map(id => <li key={id}><button type="button" disabled={disabled} className="rounded-md bg-muted px-2 py-1 text-xs" onClick={() => setSelected(previous => previous.filter(value => value !== id))}>{names[id] || query.data?.find(row => row.id === id)?.first_name || 'Tagged student'} ×<span className="sr-only"> Remove tag</span></button></li>)}</ul>}
    <div className="max-h-44 space-y-2 overflow-y-auto">
      {query.isFetching || search.trim() !== term ? <div role="status" aria-label="Loading students"><Skeleton className="mb-2 h-8 w-full" /><Skeleton className="h-8 w-full" /></div> : query.isError ? <p role="alert" className="text-xs text-destructive">{query.error.message} <button type="button" onClick={() => query.refetch()} className="underline">Retry</button></p> : query.data?.length ? query.data.map(student => <label key={student.id} className="flex items-center gap-2 text-sm"><Checkbox disabled={disabled || (!selected.includes(student.id) && selected.length >= 100)} checked={selected.includes(student.id)} onCheckedChange={checked => { setNames(previous => ({ ...previous, [student.id]: `${student.first_name} ${student.last_name}` })); setSelected(previous => checked ? [...previous, student.id] : previous.filter(id => id !== student.id)); }} />{student.first_name} {student.last_name}</label>) : <p className="text-xs text-muted-foreground">No eligible ongoing interns match. Change your search.</p>}
    </div><p className="text-xs text-muted-foreground">{selected.length}/100 selected. Search shows up to 30 matching students; selections stay when searching.</p>
  </div>;
}

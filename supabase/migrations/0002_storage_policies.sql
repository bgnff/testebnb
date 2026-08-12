-- Storage policies for task-attachments bucket

create policy "user_reads_own_attachments"
on storage.objects for select
using (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "user_uploads_own_attachments"
on storage.objects for insert
with check (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "user_deletes_own_attachments"
on storage.objects for delete
using (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

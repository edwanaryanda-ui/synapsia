-- ============================================================
-- Synapsia – Skema Supabase (SQL Editor → New query → Run)
-- Aman dijalankan berulang kali, juga di atas versi skema sebelumnya.
-- Semua tabel berawalan syn_ sehingga bisa berbagi project dengan website lain.
-- Peran akun: siswa, konselor, admin.
-- ============================================================

-- 0. Bersihkan tabel versi lama (diganti syn_items & syn_user_items)
drop table if exists public.syn_content cascade;
drop table if exists public.syn_student_data cascade;
drop function if exists public.syn_admin_list_staff();

-- 1. Pengaturan rahasia (hanya admin) & pengaturan publik
create table if not exists public.syn_settings (key text primary key, value text not null);
alter table public.syn_settings enable row level security;
insert into public.syn_settings values ('counselor_code', 'GANTI-KODE-BK') on conflict (key) do nothing;  -- << UBAH INI (min. 8 karakter)

create table if not exists public.syn_config (key text primary key, value text not null default '');
alter table public.syn_config enable row level security;
insert into public.syn_config values ('whatsapp', '') on conflict (key) do nothing;

-- 2. Profil & peran
create table if not exists public.syn_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text, kelas text default '',
  role text not null default 'siswa',
  created_at timestamptz default now()
);
alter table public.syn_profiles add column if not exists kelas text default '';
alter table public.syn_profiles drop constraint if exists syn_profiles_role_check;
update public.syn_profiles set role = 'siswa'    where role = 'student';
update public.syn_profiles set role = 'konselor' where role = 'counselor';
alter table public.syn_profiles alter column role set default 'siswa';
alter table public.syn_profiles add constraint syn_profiles_role_check check (role in ('siswa','konselor','admin'));
alter table public.syn_profiles enable row level security;

-- Profil dibuat otomatis saat daftar. Konselor wajib kode rahasia. Admin TIDAK bisa dibuat dari form.
create or replace function public.syn_handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare r text := 'siswa';
begin
  if coalesce(new.raw_user_meta_data->>'role','') = 'konselor' then
    if coalesce(new.raw_user_meta_data->>'code','') <> (select value from syn_settings where key = 'counselor_code') then
      raise exception 'Kode registrasi konselor salah';
    end if;
    r := 'konselor';
  end if;
  insert into syn_profiles (id, name, kelas, role)
  values (new.id,
          coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), 'Pengguna'),
          case when r = 'siswa' then left(coalesce(new.raw_user_meta_data->>'kelas',''), 30) else '' end, r)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists syn_on_auth_user_created on auth.users;
create trigger syn_on_auth_user_created after insert on auth.users
  for each row execute function public.syn_handle_new_user();

create or replace function public.syn_role() returns text
language sql security definer stable set search_path = public as
$$ select role from syn_profiles where id = auth.uid() $$;
create or replace function public.syn_is_staff() returns boolean
language sql security definer stable set search_path = public as
$$ select coalesce(syn_role() in ('konselor','admin'), false) $$;
create or replace function public.syn_is_admin() returns boolean
language sql security definer stable set search_path = public as
$$ select coalesce(syn_role() = 'admin', false) $$;

-- 3. Data
-- Konten bersama: strategi (konselor/admin yang boleh ubah) & tips (hanya admin)
create table if not exists public.syn_items (
  collection text not null check (collection in ('strategies','tipsList')),
  id text not null, position int not null default 0, data jsonb not null,
  updated_at timestamptz default now(),
  primary key (collection, id)
);
alter table public.syn_items enable row level security;

-- Data pribadi siswa (refleksi, tantangan, rencana aksi, profil): hanya pemilik
create table if not exists public.syn_user_items (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  collection text not null check (collection in ('reflections','challenges','actionPlans','currentStudent')),
  id text not null, position int not null default 0, data jsonb not null,
  updated_at timestamptz default now(),
  primary key (user_id, collection, id)
);
alter table public.syn_user_items enable row level security;

-- Umpan balik konselor untuk tiap siswa
create table if not exists public.syn_student_notes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'IN PROGRESS' check (status in ('COMPLETED','IN PROGRESS','NEED ATTENTION','MASTERED')),
  feedback text not null default '' check (char_length(feedback) <= 1000),
  updated_at timestamptz default now()
);
alter table public.syn_student_notes enable row level security;

-- 4. Hak akses (RLS)
drop policy if exists "profil sendiri" on public.syn_profiles;
create policy "profil sendiri" on public.syn_profiles for select to authenticated using (id = auth.uid());

drop policy if exists "settings admin" on public.syn_settings;
create policy "settings admin" on public.syn_settings for all to authenticated
  using (syn_is_admin()) with check (syn_is_admin());

drop policy if exists "config dibaca semua" on public.syn_config;
create policy "config dibaca semua" on public.syn_config for select to anon, authenticated using (true);
drop policy if exists "config admin" on public.syn_config;
create policy "config admin" on public.syn_config for all to authenticated
  using (syn_is_admin()) with check (syn_is_admin());

drop policy if exists "items dibaca" on public.syn_items;
create policy "items dibaca" on public.syn_items for select to anon, authenticated using (true);
drop policy if exists "items strategi" on public.syn_items;
create policy "items strategi" on public.syn_items for all to authenticated
  using (collection = 'strategies' and syn_is_staff()) with check (collection = 'strategies' and syn_is_staff());
drop policy if exists "items tips" on public.syn_items;
create policy "items tips" on public.syn_items for all to authenticated
  using (collection = 'tipsList' and syn_is_admin()) with check (collection = 'tipsList' and syn_is_admin());

drop policy if exists "data siswa milik sendiri" on public.syn_user_items;
create policy "data siswa milik sendiri" on public.syn_user_items for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "catatan dibaca siswa" on public.syn_student_notes;
create policy "catatan dibaca siswa" on public.syn_student_notes for select to authenticated using (user_id = auth.uid());
drop policy if exists "catatan dikelola staf" on public.syn_student_notes;
create policy "catatan dikelola staf" on public.syn_student_notes for all to authenticated
  using (syn_is_staff()) with check (syn_is_staff());

-- 4b. Izin akses tabel untuk Data API (aman diulang; wajib di project Supabase baru)
grant usage on schema public to anon, authenticated;
grant select on public.syn_config, public.syn_items to anon;
grant select, insert, update, delete on public.syn_config, public.syn_items, public.syn_user_items,
  public.syn_student_notes, public.syn_settings to authenticated;
grant select on public.syn_profiles to authenticated;

-- 4c. Buat profil untuk akun yang SUDAH terdaftar sebelum skema ini dijalankan
-- (tanpa baris ini, akun lama tidak bisa masuk karena belum punya profil). Peran awal: siswa.
insert into public.syn_profiles (id, name, kelas, role)
select u.id,
       coalesce(nullif(trim(u.raw_user_meta_data->>'name'), ''), split_part(u.email, '@', 1), 'Pengguna'),
       left(coalesce(u.raw_user_meta_data->>'kelas', ''), 30), 'siswa'
from auth.users u
where not exists (select 1 from public.syn_profiles p where p.id = u.id);

-- 4d. Pengaman: dipanggil aplikasi saat login jika profil belum ada (mis. trigger pendaftaran tidak berjalan).
-- Peran konselor hanya diberikan jika kode registrasi pada data pendaftaran cocok.
create or replace function public.syn_ensure_profile() returns void
language plpgsql security definer set search_path = public as $$
declare u auth.users%rowtype; r text := 'siswa';
begin
  select * into u from auth.users where id = auth.uid();
  if u.id is null then return; end if;
  if exists (select 1 from syn_profiles where id = u.id) then return; end if;
  if coalesce(u.raw_user_meta_data->>'role','') = 'konselor'
     and coalesce(u.raw_user_meta_data->>'code','') = (select value from syn_settings where key = 'counselor_code') then
    r := 'konselor';
  end if;
  insert into syn_profiles (id, name, kelas, role)
  values (u.id,
          coalesce(nullif(trim(u.raw_user_meta_data->>'name'), ''), split_part(u.email, '@', 1), 'Pengguna'),
          case when r = 'siswa' then left(coalesce(u.raw_user_meta_data->>'kelas',''), 30) else '' end, r)
  on conflict (id) do nothing;
end $$;
revoke all on function public.syn_ensure_profile() from public, anon;
grant execute on function public.syn_ensure_profile() to authenticated;

-- 4f. Login nama pengguna tanpa konfirmasi email.
-- Akun nama-pengguna memakai email internal (@synapsia.app) yang tidak punya kotak surat, jadi konfirmasi email tidak berlaku.
-- (Jika kamu mengubah LOGIN_DOMAIN di config.js, ganti '%@synapsia.app' di bawah dengan domain yang sama.)
update auth.users set email_confirmed_at = now()
  where email_confirmed_at is null and lower(email) like '%@synapsia.app';

create or replace function public.syn_autoconfirm_new() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) like '%@synapsia.app' and new.email_confirmed_at is null then new.email_confirmed_at := now(); end if;
  return new;
end $$;
drop trigger if exists syn_autoconfirm_bi on auth.users;
create trigger syn_autoconfirm_bi before insert on auth.users
  for each row execute function public.syn_autoconfirm_new();

-- Dipanggil aplikasi saat Supabase menahan akun nama-pengguna: hanya berlaku untuk domain internal.
create or replace function public.syn_autoconfirm(p_email text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if lower(coalesce(p_email, '')) like '%@synapsia.app' then
    update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where lower(email) = lower(p_email);
  end if;
end $$;
revoke all on function public.syn_autoconfirm(text) from public;
grant execute on function public.syn_autoconfirm(text) to anon, authenticated;

-- 4e. Pesan konselor <-> siswa
-- Satu percakapan per siswa. Semua konselor/admin dapat membaca dan membalas; siswa hanya melihat percakapannya sendiri.
-- Pesan tidak bisa diubah atau dihapus oleh pengguna (hanya terhapus bersama akun siswa).
-- Jika sudah ada tabel syn_messages versi lama (kolomnya berbeda), ganti namanya agar datanya tetap aman.
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'syn_messages')
     and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'syn_messages' and column_name = 'student_id') then
    execute 'alter table public.syn_messages rename to syn_messages_lama';
  end if;
end $$;

create table if not exists public.syn_messages (
  id bigint generated always as identity primary key,
  student_id uuid not null references auth.users(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('siswa','konselor','admin')),
  sender_name text not null default '',
  body text not null check (char_length(btrim(body)) between 1 and 1500),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists syn_messages_thread_idx on public.syn_messages (student_id, created_at desc);
alter table public.syn_messages enable row level security;

-- Pengirim, peran, nama, dan waktu SELALU diisi server (tidak bisa dipalsukan dari browser).
create or replace function public.syn_msg_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare p public.syn_profiles%rowtype;
begin
  select * into p from public.syn_profiles where id = auth.uid();
  if p.id is null then raise exception 'Profil tidak ditemukan'; end if;
  new.sender_id := auth.uid();
  new.sender_role := p.role;
  new.sender_name := p.name;
  new.body := btrim(new.body);
  new.read_at := null;
  new.created_at := now();
  if p.role = 'siswa' then new.student_id := auth.uid(); end if;
  return new;
end $$;
drop trigger if exists syn_msg_bi on public.syn_messages;
create trigger syn_msg_bi before insert on public.syn_messages
  for each row execute function public.syn_msg_before_insert();

drop policy if exists "pesan dibaca" on public.syn_messages;
create policy "pesan dibaca" on public.syn_messages for select to authenticated
  using (student_id = auth.uid() or syn_is_staff());
drop policy if exists "pesan dikirim" on public.syn_messages;
create policy "pesan dikirim" on public.syn_messages for insert to authenticated
  with check (
    (syn_role() = 'siswa' and student_id = auth.uid())
    or (syn_is_staff() and exists (select 1 from public.syn_profiles s where s.id = student_id and s.role = 'siswa'))
  );
grant select, insert on public.syn_messages to authenticated;

-- Daftar percakapan untuk staf: semua siswa, yang terbaru di atas, beserta jumlah pesan belum dibaca.
create or replace function public.syn_msg_threads() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not syn_is_staff() then raise exception 'Akses ditolak'; end if;
  return coalesce((
    select jsonb_agg(x.t order by x.t->>'last_at' desc nulls last, x.t->>'name')
    from (
      select jsonb_build_object(
        'id', p.id, 'name', p.name, 'kelas', coalesce(nullif(p.kelas, ''), '-'),
        'last_body', lm.body, 'last_at', lm.created_at, 'last_role', lm.sender_role,
        'unread', (select count(*) from public.syn_messages m where m.student_id = p.id and m.sender_role = 'siswa' and m.read_at is null)
      ) as t
      from public.syn_profiles p
      left join lateral (select body, created_at, sender_role from public.syn_messages where student_id = p.id order by created_at desc limit 1) lm on true
      where p.role = 'siswa'
    ) x), '[]'::jsonb);
end $$;

-- Jumlah pesan belum dibaca (staf: dari semua siswa; siswa: dari konselor).
create or replace function public.syn_msg_unread() returns integer
language plpgsql security definer set search_path = public as $$
begin
  if syn_is_staff() then
    return (select count(*)::int from public.syn_messages where sender_role = 'siswa' and read_at is null);
  end if;
  return (select count(*)::int from public.syn_messages where student_id = auth.uid() and sender_role <> 'siswa' and read_at is null);
end $$;

-- Tandai percakapan sudah dibaca (staf: percakapan siswa tertentu; siswa: percakapannya sendiri).
create or replace function public.syn_msg_mark_read(p_student uuid default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if syn_is_staff() then
    update public.syn_messages set read_at = now()
      where student_id = p_student and sender_role = 'siswa' and read_at is null;
  else
    update public.syn_messages set read_at = now()
      where student_id = auth.uid() and sender_role <> 'siswa' and read_at is null;
  end if;
end $$;
revoke all on function public.syn_msg_threads(), public.syn_msg_unread(), public.syn_msg_mark_read(uuid) from public, anon;
grant execute on function public.syn_msg_threads(), public.syn_msg_unread(), public.syn_msg_mark_read(uuid) to authenticated;

-- 5. Fungsi untuk panel konselor & admin
-- Ringkasan siswa: hanya nama, kelas, progres, streak, suasana hati & refleksi terakhir
create or replace function public.syn_student_rows() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not syn_is_staff() then raise exception 'Akses ditolak'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', p.id, 'name', p.name, 'kelas', coalesce(nullif(p.kelas, ''), '-'),
      'avatar', coalesce(cs.data->>'avatar', ''),
      'progress', case when ch.total > 0 then round(ch.done * 100.0 / ch.total) else 0 end,
      'streak', coalesce(nullif(cs.data->>'streak', '')::int, 0),
      'status', coalesce(n.status, 'IN PROGRESS'),
      'mood', coalesce(rf.data->>'mood', 'Belum ada refleksi'),
      'lastReflection', coalesce(rf.data->>'mainChallenge', 'Belum ada refleksi.'),
      'counselorFeedback', coalesce(n.feedback, '')) order by u.created_at desc)
    from syn_profiles p
    join auth.users u on u.id = p.id
    left join syn_student_notes n on n.user_id = p.id
    left join lateral (select data from syn_user_items where user_id = p.id and collection = 'currentStudent' limit 1) cs on true
    left join lateral (select data from syn_user_items where user_id = p.id and collection = 'reflections' order by position limit 1) rf on true
    left join lateral (select count(*) as total, count(*) filter (where data->>'completed' = 'true') as done
                       from syn_user_items where user_id = p.id and collection = 'challenges') ch on true
    where p.role = 'siswa' and u.email is not null), '[]'::jsonb);
end $$;

create or replace function public.syn_admin_users() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not syn_is_admin() then raise exception 'Akses ditolak'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'email', u.email, 'role', p.role,
                                        'kelas', coalesce(p.kelas, ''), 'created_at', u.created_at) order by u.created_at desc)
    from syn_profiles p join auth.users u on u.id = p.id where u.email is not null), '[]'::jsonb);
end $$;

-- Hapus akun beserta seluruh datanya (bukan diri sendiri, bukan admin)
create or replace function public.syn_admin_delete_user(uid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not syn_is_admin() then raise exception 'Akses ditolak'; end if;
  if uid = auth.uid() then raise exception 'Tidak bisa menghapus akunmu sendiri'; end if;
  if exists (select 1 from syn_profiles where id = uid and role = 'admin') then raise exception 'Akun admin tidak bisa dihapus dari sini'; end if;
  delete from auth.users where id = uid;
end $$;

revoke all on function public.syn_role(), public.syn_is_staff(), public.syn_is_admin(),
  public.syn_student_rows(), public.syn_admin_users(), public.syn_admin_delete_user(uuid) from public, anon;
grant execute on function public.syn_role(), public.syn_is_staff(), public.syn_is_admin(),
  public.syn_student_rows(), public.syn_admin_users(), public.syn_admin_delete_user(uuid) to authenticated;

-- ============================================================
-- BUAT AKUN ADMIN: Authentication → Users → Add user (isi email & kata sandi, centang Auto Confirm),
-- lalu jalankan baris ini dengan emailnya:
-- update public.syn_profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'emailmu@contoh.id');
-- ============================================================

-- ============================================================
-- Segarkan cache API agar tabel baru langsung terbaca (jalankan di akhir)
notify pgrst, 'reload schema';
-- ============================================================

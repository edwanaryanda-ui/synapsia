# Synapsia (Supabase)

Website statis tanpa server sendiri. Akun, data, dan hak akses disimpan di Supabase (Postgres + Auth + RLS).

## Struktur (SEMUA file dalam satu folder yang sama)
```
synapsia/
├── index.html           Kerangka halaman
├── config.js            <-- isi URL & anon key Supabase
├── schema.sql           Tabel, trigger, hak akses (dijalankan di Supabase)
├── style-base.css  style-theme.css  style-landing.css
├── app-01-avatars.js  ...  app-11-main.js   (urutan dimuat sudah diatur di index.html)
└── logo.png  logo-sm.png  favicon.png
```
Jika ada file yang hilang, halaman menampilkan daftar file yang tidak ditemukan.

## Langkah
1. Supabase → **SQL Editor → New query**: tempel `schema.sql`, **ubah kode `GANTI-KODE-BK`** (min. 8 karakter), lalu **Run**. Aman dijalankan di atas skema versi sebelumnya.
2. **Authentication → Providers → Email**: aktif, dan **matikan *Confirm email*** (wajib: login memakai nama pengguna, jadi tidak ada email yang bisa dikonfirmasi).
3. **Project Settings → API**: salin Project URL dan anon/publishable key ke `config.js` (jangan pakai service_role key).
4. Buat admin: **Authentication → Users → Add user** (centang Auto Confirm), lalu jalankan SQL di bagian bawah `schema.sql`.
5. Jalankan lokal lewat server (`python -m http.server 8000`), bukan klik dua kali.
6. Masuk sebagai admin → tab **Akun**: atur kode registrasi konselor dan nomor WhatsApp BK.

## Peran & privasi
- **Siswa**: daftar sendiri (nama, kelas, email). Refleksi, tantangan, dan rencana aksi hanya bisa dibaca pemiliknya.
- **Konselor**: daftar dengan kode registrasi. Melihat ringkasan siswa (nama, kelas, progres, streak, suasana hati), memberi catatan, mengelola strategi. Tidak membaca isi data pribadi lain.
- **Admin**: dibuat lewat dashboard Supabase. Mengelola tips, semua akun (hapus), kode registrasi, dan nomor WhatsApp.
- Sesi login disimpan di sessionStorage: otomatis hilang saat tab ditutup.

## Hosting
Unggah seluruh folder ke Netlify / Cloudflare Pages / Vercel / GitHub Pages (tanpa build). Tambahkan alamat situs di Supabase **Authentication → URL Configuration**.

## Jika halaman kosong atau tampil berantakan
- Pastikan koneksi internet aktif: Tailwind, ikon Lucide, Supabase, dan font dimuat dari CDN (versinya sudah dikunci).
- Pastikan semua file ada dalam satu folder yang sama dengan index.html (tanpa subfolder css/ atau js/).
- Buka lewat Live Server atau `python -m http.server 8000`, lalu muat ulang dengan Ctrl+Shift+R.

## Jika tidak bisa masuk padahal email sudah dikonfirmasi
Pesan di jendela login sekarang menyebut penyebab sebenarnya. Penyebab tersering: akun dibuat **sebelum** `schema.sql` dijalankan, sehingga belum punya baris di `syn_profiles`. Jalankan ulang `schema.sql` (aman diulang; bagian 4c membuat profil untuk akun lama), lalu masuk lagi. Detail teknis juga dicetak di Console browser (F12).

## Tabel tidak ditemukan ("syn_profiles belum ada")
Artinya project Supabase yang dihubungi `config.js` belum punya tabel `syn_*`. Cek berurutan:
1. Nama project di pesan error harus sama dengan project tempat kamu menjalankan SQL (lihat `SUPABASE_URL` di `config.js`; bagian sebelum `.supabase.co` adalah ID project).
2. Di SQL Editor, **jangan blok/seleksi sebagian teks** saat menekan Run: Supabase hanya menjalankan teks yang terseleksi. Klik di dalam editor, tekan Ctrl+A, lalu Run.
3. Pastikan hasilnya "Success" tanpa tulisan merah. Jika ada error, salin pesannya.
4. Verifikasi dengan query ini, hasilnya harus berisi 6 tabel (syn_config, syn_items, syn_profiles, syn_settings, syn_student_notes, syn_user_items):
   `select table_name from information_schema.tables where table_schema='public' and table_name like 'syn\_%';`
5. Jika tabel ada tetapi pesan masih sama: Project Settings → API → pastikan schema `public` ada di *Exposed schemas*, lalu jalankan `notify pgrst, 'reload schema';`.

## Login dengan nama pengguna + kata sandi
- Siswa dan konselor mendaftar dengan **nama lengkap**, **nama pengguna** (huruf kecil/angka/titik/garis bawah, tanpa spasi), dan kata sandi. Tidak ada email yang diminta atau dikirim.
- Di balik layar, nama pengguna diubah menjadi email internal `namapengguna@synapsia.app` (domain bisa diubah lewat `LOGIN_DOMAIN` di `config.js`; email ini tidak pernah menerima pesan). Jika Supabase menolak domain itu, ganti ke domain lain.
- Konfirmasi email **otomatis** untuk akun nama pengguna (bagian 4f `schema.sql`: akun lama dikonfirmasi sekaligus, akun baru dan yang tertahan dikonfirmasi saat masuk). Matikan juga *Confirm email* di Authentication → Providers → Email supaya lebih mulus. Jika `LOGIN_DOMAIN` diubah, ubah juga `%@synapsia.app` di bagian 4f.
- Admin dan akun lama yang memakai email asli tetap bisa masuk: ketik emailnya pada kolom "Nama pengguna".
- Karena tidak ada email pemulihan, kata sandi yang lupa direset admin lewat Authentication → Users di Supabase.

## Profil tidak terbuat saat daftar
Profil dibuat otomatis oleh trigger `syn_on_auth_user_created` (ada di `schema.sql`). Jika trigger belum ada, aplikasi memanggil fungsi `syn_ensure_profile()` saat login untuk membuatkan profil. Keduanya butuh `schema.sql` sudah dijalankan penuh.

## Tampilan dalam (setelah masuk) dan fitur Pesan
- **Bingkai aplikasi** sama dengan beranda: latar taupe, bingkai krem, kapsul navigasi, dock ikon, judul serif. Kodenya: `style-app.css` (gaya) dan `app-12-shell.js` (bingkai + lencana pesan belum dibaca). Semua dashboard (siswa, konselor, admin) tampil di dalam bingkai ini.
- **Pesan konselor ↔ siswa** (`app-13-messages.js`): siswa punya satu percakapan dengan Guru BK (tab *Pesan*); konselor/admin melihat daftar semua siswa, pesan belum dibaca ditandai, dan bisa membalas, memakai kalimat cepat, atau membuka dari kartu siswa lewat tombol *Kirim pesan*. Pesan terbaru dari konselor juga tampil di beranda siswa. Pesan dimuat ulang tiap 5 detik saat dibuka (tanpa Realtime).
- **Wajib:** jalankan ulang `schema.sql` (aman diulang) agar tabel `syn_messages` dan fungsi `syn_msg_*` terbentuk. Jika belum, tab Pesan menampilkan petunjuk ini.
- **Privasi:** siswa hanya dapat membaca percakapannya sendiri. Semua konselor dan admin dapat membaca seluruh percakapan (kotak masuk bersama). Pengirim, peran, dan waktu diisi server sehingga tidak bisa dipalsukan. Pesan tidak dapat diubah atau dihapus pengguna; pesan terhapus bersama akun siswa. Pertimbangkan memberi tahu siswa dan orang tua bahwa pesan dapat dibaca guru BK.
- Fitur ini bukan layanan darurat; halaman Pesan siswa memuat pengingat untuk menghubungi orang dewasa tepercaya bila merasa tidak aman.

## Pesan gagal terkirim
Pesan error sekarang menyebut penyebabnya (juga tercetak di Console, F12). Untuk memeriksa langsung di Supabase SQL Editor:
```sql
-- 1) Peran akun pengirim (harus 'konselor' atau 'admin' untuk membalas siswa)
select p.name, p.role, u.email from public.syn_profiles p join auth.users u on u.id = p.id order by p.role;
-- 2) Kolom tabel pesan (harus ada student_id, sender_id, sender_role, sender_name, body, created_at, read_at)
select column_name from information_schema.columns where table_schema='public' and table_name='syn_messages';
-- 3) Aturan dan pemicu (harus ada "pesan dibaca", "pesan dikirim", dan syn_msg_bi)
select policyname, cmd from pg_policies where tablename='syn_messages';
select tgname from pg_trigger where tgrelid='public.syn_messages'::regclass and not tgisinternal;
```
Jika peran konselor masih `siswa`, ubah: `update public.syn_profiles set role='konselor' where id=(select id from auth.users where email='...');`

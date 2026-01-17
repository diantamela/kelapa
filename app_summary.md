Berikut ringkasan **lengkap** (tapi tetap enak dipakai buat “vibe coding”) tentang **alur aplikasi** dan **fitur utama** untuk Smart Payroll + Manajemen Produksi dengan stack **Next.js + Tailwind + shadcn/ui + Prisma + Postgres + Docker**.

---

## Gambaran Umum Aplikasi

Aplikasi ini adalah sistem operasional pabrik kelapa yang mengintegrasikan:

* **RMP**: penerimaan bahan baku kelapa masuk + penyortiran
* **MP**: pencatatan produksi (cungkil manual, cungkil mesin, shaler)
* **Absensi & Jam Kerja**: untuk pekerja harian
* **Payroll Otomatis**: gaji harian + gaji borongan (berdasarkan output produksi)
* **Workflow Validasi/Finalisasi**: agar perhitungan tidak bisa sembarang berubah
* **Laporan Manajerial**: monitoring harian dan rekap periode

Tujuan utamanya: **mengurangi input ganda, meminimalkan salah hitung, mempercepat rekap, dan membuat data produksi & payroll saling nyambung.**

---

## Aktor (Role) & Hak Akses

1. **Pegawai RMP**

* Input & lihat data **kelapa masuk** dan **penyortiran**
* Kelola data **distributor**
* Lihat riwayat pencatatan

2. **Pegawai MP**

* Input data produksi (manual/mesin/shaler)
* Lihat ringkasan bahan baku harian
* Lihat riwayat produksi pribadi
* Lihat estimasi gaji/premi (tanpa bisa finalisasi)

3. **Staff HR (Administrasi)**

* Kelola data karyawan (harian/borongan), parameter gaji, tarif borongan
* Kelola absensi & jam kerja
* Menjalankan perhitungan payroll (harian & borongan)
* Validasi & finalisasi payroll
* Cetak slip gaji, download laporan payroll

4. **Manajer**

* Akses laporan: kelapa masuk/penyortiran, produksi, absensi, payroll, rekap
* Read-only + filter periode + export

---

## Alur Aplikasi End-to-End (User Flow)

### 1) Login → Dashboard sesuai Role

* User login.
* Sistem mendeteksi role lalu mengarahkan ke dashboard modul masing-masing (RMP/MP/HR/Manajer).
* Ini penting untuk keamanan data dan membatasi akses fitur.

---

### 2) Setup Master Data (Fondasi Sistem)

Biasanya dikerjakan oleh HR/Admin pada awal implementasi:

* **Data karyawan**: nama, jabatan, divisi, status aktif, tipe kerja (harian/borongan)
* **Tarif borongan**: jenis pekerjaan (shelling/paring/shaler), satuan (kg/butir), harga per satuan
* **Parameter gaji**: aturan uang makan (mis. >8 jam), premi, potongan, dll
* **Data distributor** (opsional bisa oleh RMP)

Tanpa master data ini, sistem payroll otomatis tidak bisa jalan konsisten.

---

### 3) Operasional Harian RMP (Bahan Baku Masuk & Penyortiran)

Pegawai RMP melakukan input harian:

* **Kelapa masuk**

  * tanggal
  * distributor
  * tonase / jumlah
  * kualitas/grade
  * catatan (jika ada)
* **Penyortiran**

  * hasil sortir (mis. layak/tidak layak atau klasifikasi tertentu)
  * catatan kerusakan/afkir

Output yang dihasilkan:

* Riwayat penerimaan per hari/per distributor
* Ringkasan bahan baku harian (digunakan MP)

---

### 4) Operasional Harian MP (Produksi)

Pegawai MP menggunakan ringkasan dari RMP sebagai acuan bahan baku, lalu input produksi:

* **Cungkil Manual**
* **Cungkil Mesin**
* **Kelapa Shaler**

Setiap input produksi minimal mencatat:

* tanggal
* jenis proses
* pekerja/shift (atau operator)
* jumlah output (kg/butir)
* catatan (opsional)

Fitur tambahan penting:

* **Riwayat produksi pribadi** untuk pekerja
* **Estimasi gaji & premi** otomatis dari:

  * total output × tarif borongan (untuk pekerja borongan)
  * atau sebagai informasi performa

---

### 5) Absensi & Jam Kerja (Untuk Pekerja Harian)

Staff HR mengelola absensi:

* check-in/check-out (atau input manual jam kerja)
* sistem hitung total jam kerja per hari
* aturan otomatis:

  * **uang makan aktif jika jam kerja > 8 jam**
  * dan parameter lain jika dibutuhkan

Output:

* Rekap absensi harian/mingguan/bulanan
* Data ini menjadi input utama payroll harian

---

### 6) Payroll Otomatis (Harian & Borongan) + Workflow Kontrol

Staff HR membuat **periode payroll** (mis. mingguan/bulanan), lalu sistem menghasilkan draft payroll dari data yang sudah masuk.

#### A) Payroll Harian

Sumber data:

* absensi + jam kerja
* aturan uang makan/premi/potongan

Rumus umum:

* gaji = (hari kerja/jam kerja × rate) + uang makan + premi – potongan

#### B) Payroll Borongan

Sumber data:

* total output produksi per pekerja dalam periode
* tarif borongan per jenis pekerjaan

Rumus umum:

* gaji = Σ(output × tarif)

#### C) Status Workflow (wajib agar rapi)

* **Draft**: masih boleh koreksi data (absensi/produksi)
* **Validated**: HR menyetujui perhitungan (mulai dikunci sebagian)
* **Final**: payroll terkunci, slip gaji bisa dicetak, data jadi arsip resmi

Fitur setelah final:

* **Slip gaji** per karyawan
* **Rekap payroll** per periode
* histori payroll tersimpan dan tidak mudah diubah

---

### 7) Laporan Manajer (Monitoring & Kontrol)

Manajer melihat laporan dengan filter periode (tanggal, minggu, bulan):

* **Laporan kelapa masuk & penyortiran** (RMP)
* **Laporan produksi** (MP) per proses/shift/pekerja
* **Laporan absensi & jam kerja**
* **Laporan penggajian & premi**
* **Rekapitulasi data** (ringkasan KPI sederhana)

Tambahan yang sangat “value”:

* Export PDF/Excel untuk rapat/arsip

---

### 8) Kontrol Selisih (Bahan Masuk vs Diproses)

Fitur kontrol untuk mendeteksi ketidaksesuaian:

* bandingkan **total bahan masuk** (RMP) vs **total bahan diproses/produksi** (MP)
* tampilkan selisih per hari/per periode
* bisa jadi indikator: waste, kehilangan, input belum tercatat, atau masalah alur produksi

---

## Fitur Utama (Checklist Implementasi)

### Core

* Authentication (login)
* RBAC (role-based access control)
* Dashboard per role

### Modul RMP

* CRUD distributor
* Input kelapa masuk
* Input penyortiran
* Riwayat & ringkasan bahan baku

### Modul MP

* Input produksi (manual/mesin/shaler)
* Riwayat produksi pribadi
* Estimasi gaji/premi (read-only)

### Modul Absensi (HR)

* Input absensi + jam kerja
* Aturan uang makan >8 jam
* Rekap absensi

### Modul Payroll (HR)

* Generate payroll per periode (harian & borongan)
* Parameter gaji/premi fleksibel
* Validasi & finalisasi (locking)
* Slip gaji
* Laporan payroll & export

### Laporan (Manajer)

* Laporan RMP
* Laporan MP
* Laporan absensi
* Laporan payroll
* Rekap + kontrol selisih

### Supporting (recommended)

* Audit log (siapa input/ubah & kapan)
* Notifikasi sederhana (mis. payroll sudah final)
* PWA-ready (opsional): lebih nyaman di HP, caching halaman form

---

Kalau kamu mau lanjut ke langkah “langsung ngoding”, aku bisa sekalian bikinin:

1. **Struktur folder Next.js (App Router)** sesuai modul & role
2. **Prisma schema** untuk tabel inti (RMP/MP/Absensi/Payroll/Reports)
3. **Daftar endpoint API** + payload contoh buat tiap use case (biar cepat bikin UI shadcn Table/Form)

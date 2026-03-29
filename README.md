# Baraya

## Informasi Mahasiswa

- Nama : Naufal Rakan Ramadhan
- NIM : 2410501042
- Opsi : C - Baraya

## Deskripsi Aplikasi

Baraya adalah aplikasi mobile berbasis React Native (Expo) untuk membantu persiapan mudik. Aplikasi ini memungkinkan pengguna mengelola:

- Packing checklist (daftar barang) dengan progress berdasarkan item yang sudah dicentang.
- Kunjungan keluarga (nama dan alamat) dengan status “sudah/ belum” serta progress kunjungan.
- Anggaran pengeluaran mudik (kategori, nominal, tambah/hapus pengeluaran) beserta ringkasan anggaran dan chart per kategori.

## Hooks yang Digunakan

- useState: Digunakan di Context (untuk state hydration AsyncStorage) dan Screens (mengelola state lokal seperti form input pengunjung, input pengeluaran, dll).
- useEffect: Digunakan di Context untuk load/save data ke AsyncStorage, dan di komponen (seperti ProgressBar atau ThemeContext) untuk transisi animasi ketika state berubah.
- useReducer: Digunakan di provider untuk mengelola state kompleks. Action types yang dipakai:
  - `BudgetContext`: `INIT`, `ADD_EXPENSE`, `DELETE_EXPENSE`, `SET_BUDGET_LIMIT`
  - `PackingContext`: `INIT_ITEMS`, `ADD_ITEM`, `TOGGLE_ITEM`, `DELETE_ITEM`
  - `VisitsContext`: `INIT_VISITS`, `ADD_VISIT`, `TOGGLE_VISIT`, `DELETE_VISIT`
- Custom Hook:
  - `useBudget()` : mengambil data budget (items, totalBudget, remainingBudget) dan menyediakan fungsi `addExpense` serta `deleteExpense`.
  - `usePackingList()` : mengambil daftar packing, menyediakan `addItem`, `toggleItem`, `deleteItem`, serta menghitung `progressPercentage`.
  - `useVisits()` : mengambil data kunjungan, menyediakan `addVisit`, `toggleVisit`, `deleteVisit`, serta menghitung nilai progress.

## Screenshot

### Dashboard
<p align="center">
  <img src="https://res.cloudinary.com/drrmbeiyk/image/upload/v1774616238/dashboard_rdgdgf.webp" alt="dashboard" width="300" />
</p>

### Packing
<p align="center">
  <img src="https://res.cloudinary.com/drrmbeiyk/image/upload/v1774616239/packing_urfgpw.webp" alt="packing" width="300" />
</p>

### Kunjungan
<p align="center">
  <img src="https://res.cloudinary.com/drrmbeiyk/image/upload/v1774616239/kunjungan_n1sepk.webp" alt="kunjungan" width="300" />
</p>

### Anggaran
<p align="center">
  <img src="https://res.cloudinary.com/drrmbeiyk/image/upload/v1774616239/anggaran_suyksy.webp" alt="anggaran" width="300" />
</p>

## Cara Menjalankan

```bash
npm install && npx expo start
```

import { Head } from '@inertiajs/react';

export default function GuestLayout({ children }) {
  return (
    <>
      <Head title="RekapHP" />
      {children}
    </>
  );
}
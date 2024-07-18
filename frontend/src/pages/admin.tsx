import React from 'react';
import Link from 'next/link';



const AdminPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Mangalore Jewellery Works</h1>
          <div className="flex items-center gap-2">
            <Link href="#" className="hover:underline" prefetch={false}>
              Contact
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-background text-foreground py-6 px-4 flex flex-col justify-center">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-4">Admin Page</h2>
          <p className="text-lg">This is the admin page</p>
        </div>
      </main>
      <footer className="bg-muted text-muted-foreground py-2 px-4 flex-col justify-center">
        <div className="container mx-auto flex items-center justify-between">
          <p className="text-xs">&copy; 2024 Mangalore Jewellery Works</p>
          <div className="flex items-center gap-2">
            <Link href="#" className="hover:underline" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="#" className="hover:underline" prefetch={false}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminPage;
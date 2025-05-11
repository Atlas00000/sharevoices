import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Shared Voices</title>
        <meta name="description" content="Informing, Inspiring, and Empowering Global Action" />
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold text-primary mb-4">Shared Voices</h1>
        <p className="text-lg text-gray-600">Informing, Inspiring, and Empowering Global Action</p>
      </main>
    </>
  );
} 
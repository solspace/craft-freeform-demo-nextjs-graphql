import Form from '@/app/form';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h2 className="mb-3 text-2xl font-semibold">NextJS + GraphQL demo for Freeform 4.x for Craft</h2>
      <Form />
    </main>
  );
};

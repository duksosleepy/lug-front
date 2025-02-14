import ExcelProcessor from '@/app/components/ExcelProcessor';
import { Toaster } from '@/app/components/ui/toaster';

export default function Home() {
  return (
    <main>
      <ExcelProcessor />
      <Toaster />
    </main>
  );
}

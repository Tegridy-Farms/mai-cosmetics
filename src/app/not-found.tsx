import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center p-6">
      <div className="max-w-[520px] w-full text-center bg-white border border-border rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-text-primary">הדף לא נמצא</h1>
        <p className="mt-2 text-[13px] text-text-muted">הקישור שפתחת לא קיים.</p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-4 rounded-xl bg-primary text-white font-semibold"
          >
            חזרה לדאשבורד
          </Link>
        </div>
      </div>
    </div>
  );
}


import LeftSidebar from "../sidebar/LeftSidebar";

export default function Patient({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <LeftSidebar />
      <main className="flex-1 p-6 bg-slate-50 min-h-screen">{children}</main>
    </div>
  );
}

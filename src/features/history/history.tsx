import LeftSidebar from "../sidebar/LeftSidebar";
import TopBar from "../sidebar/TopBar";
import HistoryContent from "./HistoryContent";

export default function History({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <LeftSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">{children}
          <HistoryContent />
        </main>
      </div>
    </div>
  );
}

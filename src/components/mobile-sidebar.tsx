import { Button } from "./ui/button";
import { MenuIcon } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "./ui/sheet";
import { Sidebar } from "./sidebar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" className="lg:hidden">
          <MenuIcon className="size-5 text-neutral-500" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetTitle></SheetTitle>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};

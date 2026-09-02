import AccountSidebar from "@/components/account/AccountSidebar";
import Breadcrumb from "@/components/account/Breadcrumb";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen dark:bg-gray-900">
      <div className="max-w-7xl mx-auto sm:px-2 md:px-4 lg:px-8 py-3">
        {/* Layout */}
        <div className="md:mt-4 flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="hidden lg:block w-[220px] flex-shrink-0">
            <AccountSidebar />
          </div>

          {/* Page Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

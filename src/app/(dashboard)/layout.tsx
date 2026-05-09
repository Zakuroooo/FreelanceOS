import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-wrapper">
      <div className="sidebar-container">
        <Sidebar />
      </div>
      
      <div className="dashboard-main">
        <TopBar />
        <main className="dashboard-content">
          {children}
        </main>
      </div>

      <BottomNav />

      <style>{`
        .dashboard-wrapper {
          display: flex;
          min-height: 100vh;
          background: #060608;
        }

        .dashboard-main {
          flex: 1;
          margin-left: 220px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .dashboard-content {
          flex: 1;
          padding: 32px;
          padding-bottom: 64px; /* Default bottom padding */
        }

        @media (max-width: 768px) {
          .sidebar-container {
            display: none !important;
          }
          
          .dashboard-main {
            margin-left: 0;
          }
          
          .dashboard-content {
            padding: 16px;
            padding-bottom: 80px; /* Space for bottom nav */
          }
        }
      `}</style>
    </div>
  )
}

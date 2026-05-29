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
      <Sidebar />

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
          margin-left: 60px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: none;
        }

        .dashboard-content {
          flex: 1;
          padding: 28px 32px 64px;
        }

        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0;
          }
          .dashboard-content {
            padding: 16px;
            padding-bottom: 80px;
          }
        }
      `}</style>
    </div>
  )
}

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export function ClientLayout() {
  return (
    <div className="app-layout">
      <Sidebar type="client" />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminLayout() {
  return (
    <div className="app-layout">
      <Sidebar type="admin" />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

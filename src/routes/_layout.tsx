import { createFileRoute, Outlet } from '@tanstack/react-router';
import Layout from '../components/Layout';

export const Route = createFileRoute('/_layout')({
  component: LayoutRoute,
});

function LayoutRoute() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
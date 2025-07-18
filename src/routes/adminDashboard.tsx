import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Layout from '@/components/Layout'
import { AppSidebar } from '@/components/Sidebar'

export const Route = createFileRoute('/adminDashboard')({
  component: function AdminDashboard() {
    return (
      <Layout>
        <AppSidebar />
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-4">Admin Dashboard</h1>
          <section>
            <h2>Admin Panel</h2>
            <p>

            </p>
            <p></p>
          </section>
        </div>
      </Layout>
    )
  },
})

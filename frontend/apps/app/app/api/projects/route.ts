import type { Tables } from '@liam-hq/db/supabase/database.types'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // This is a mock implementation. In a real app, you would fetch projects from a database.
    const projects = await getProjects()

    if (!Array.isArray(projects)) {
      return NextResponse.json(
        { error: 'Invalid projects data format' },
        { status: 500 },
      )
    }

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error in projects API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 },
    )
  }
}

// Mock function to get all projects
// In a real app, this would query a database
async function getProjects(): Promise<Tables<'Project'>[]> {
  // Simulate database lookup
  const mockProjects: Tables<'Project'>[] = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Liam HQ',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: '00000000-0000-0000-0000-100000000001',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Dashboard',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: '00000000-0000-0000-0000-100000000001',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'API Service',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: '00000000-0000-0000-0000-100000000001',
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Mobile App',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: '00000000-0000-0000-0000-100000000002',
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      name: 'Analytics Platform',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: '00000000-0000-0000-0000-100000000002',
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      name: 'Enterprise Resource Planning System Development Project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: '00000000-0000-0000-0000-100000000003',
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      name: 'Customer Relationship Management Platform Integration',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: '00000000-0000-0000-0000-100000000003',
    },
    {
      id: '00000000-0000-0000-0000-000000000008',
      name: 'Mobile Application Development for Cross-Platform Deployment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: '00000000-0000-0000-0000-100000000004',
    },
    {
      id: '00000000-0000-0000-0000-000000000009',
      name: 'Data Analytics and Business Intelligence Dashboard',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: '00000000-0000-0000-0000-100000000004',
    },
    {
      id: '00000000-0000-0000-0000-000000000010',
      name: 'Cloud Infrastructure Migration and Optimization Project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: '00000000-0000-0000-0000-100000000005',
    },
  ]

  return mockProjects
}

import type { ToolMessage } from '@langchain/core/messages'
import type { Meta, StoryObj } from '@storybook/nextjs'
import type { ToolCalls as ToolCallsType } from '@/components/SessionDetailPage/schema'
import { ToolCalls } from './ToolCalls'

const meta: Meta<typeof ToolCalls> = {
  title: 'SessionDetailPage/Messages/ToolCalls',
  component: ToolCalls,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    isStreaming: {
      control: 'boolean',
      description: 'Whether the tool is currently executing',
    },
  },
}

export default meta
type Story = StoryObj<typeof ToolCalls>

// Note: We use undefined for toolMessage to test default message handling in ToolCallCard
// This avoids type assertion issues while still properly testing the UI

const schemaDesignCall: ToolCallsType[number] = {
  id: 'call_1',
  type: 'function',
  index: 0,
  function: {
    name: 'schemaDesignTool',
    arguments: JSON.stringify({
      operations: [
        // Users table
        { op: 'add', path: '/tables/users', value: { name: 'users' } },
        {
          op: 'add',
          path: '/tables/users/columns/id',
          value: { name: 'id', type: 'uuid', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/users/columns/email',
          value: {
            name: 'email',
            type: 'varchar(255)',
            notNull: true,
            unique: true,
          },
        },
        {
          op: 'add',
          path: '/tables/users/columns/username',
          value: {
            name: 'username',
            type: 'varchar(100)',
            notNull: true,
            unique: true,
          },
        },
        {
          op: 'add',
          path: '/tables/users/columns/password_hash',
          value: { name: 'password_hash', type: 'varchar(255)', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/users/columns/first_name',
          value: { name: 'first_name', type: 'varchar(100)' },
        },
        {
          op: 'add',
          path: '/tables/users/columns/last_name',
          value: { name: 'last_name', type: 'varchar(100)' },
        },
        {
          op: 'add',
          path: '/tables/users/columns/avatar_url',
          value: { name: 'avatar_url', type: 'text' },
        },
        {
          op: 'add',
          path: '/tables/users/columns/is_active',
          value: { name: 'is_active', type: 'boolean', default: true },
        },
        {
          op: 'add',
          path: '/tables/users/columns/email_verified_at',
          value: { name: 'email_verified_at', type: 'timestamp' },
        },
        {
          op: 'add',
          path: '/tables/users/columns/created_at',
          value: { name: 'created_at', type: 'timestamp', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/users/columns/updated_at',
          value: { name: 'updated_at', type: 'timestamp', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/users/constraints/pk_users',
          value: { type: 'primary_key', columns: ['id'] },
        },
        {
          op: 'add',
          path: '/tables/users/indexes/idx_email',
          value: { columns: ['email'] },
        },
        {
          op: 'add',
          path: '/tables/users/indexes/idx_username',
          value: { columns: ['username'] },
        },

        // Organizations table
        {
          op: 'add',
          path: '/tables/organizations',
          value: { name: 'organizations' },
        },
        {
          op: 'add',
          path: '/tables/organizations/columns/id',
          value: { name: 'id', type: 'uuid', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/organizations/columns/name',
          value: { name: 'name', type: 'varchar(255)', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/organizations/columns/slug',
          value: {
            name: 'slug',
            type: 'varchar(100)',
            notNull: true,
            unique: true,
          },
        },
        {
          op: 'add',
          path: '/tables/organizations/columns/description',
          value: { name: 'description', type: 'text' },
        },
        {
          op: 'add',
          path: '/tables/organizations/columns/logo_url',
          value: { name: 'logo_url', type: 'text' },
        },
        {
          op: 'add',
          path: '/tables/organizations/columns/owner_id',
          value: { name: 'owner_id', type: 'uuid', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/organizations/columns/created_at',
          value: { name: 'created_at', type: 'timestamp', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/organizations/columns/updated_at',
          value: { name: 'updated_at', type: 'timestamp', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/organizations/constraints/pk_organizations',
          value: { type: 'primary_key', columns: ['id'] },
        },
        {
          op: 'add',
          path: '/tables/organizations/constraints/fk_owner',
          value: {
            type: 'foreign_key',
            columns: ['owner_id'],
            references: { table: 'users', columns: ['id'] },
          },
        },

        // Organization members junction table
        {
          op: 'add',
          path: '/tables/organization_members',
          value: { name: 'organization_members' },
        },
        {
          op: 'add',
          path: '/tables/organization_members/columns/id',
          value: { name: 'id', type: 'uuid', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/organization_members/columns/organization_id',
          value: { name: 'organization_id', type: 'uuid', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/organization_members/columns/user_id',
          value: { name: 'user_id', type: 'uuid', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/organization_members/columns/role',
          value: {
            name: 'role',
            type: 'varchar(50)',
            notNull: true,
            default: 'member',
          },
        },
        {
          op: 'add',
          path: '/tables/organization_members/columns/invited_by',
          value: { name: 'invited_by', type: 'uuid' },
        },
        {
          op: 'add',
          path: '/tables/organization_members/columns/joined_at',
          value: { name: 'joined_at', type: 'timestamp', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/organization_members/constraints/pk_org_members',
          value: { type: 'primary_key', columns: ['id'] },
        },
        {
          op: 'add',
          path: '/tables/organization_members/constraints/fk_organization',
          value: {
            type: 'foreign_key',
            columns: ['organization_id'],
            references: { table: 'organizations', columns: ['id'] },
          },
        },
        {
          op: 'add',
          path: '/tables/organization_members/constraints/fk_user',
          value: {
            type: 'foreign_key',
            columns: ['user_id'],
            references: { table: 'users', columns: ['id'] },
          },
        },
        {
          op: 'add',
          path: '/tables/organization_members/constraints/uq_org_user',
          value: { type: 'unique', columns: ['organization_id', 'user_id'] },
        },

        // Projects table
        { op: 'add', path: '/tables/projects', value: { name: 'projects' } },
        {
          op: 'add',
          path: '/tables/projects/columns/id',
          value: { name: 'id', type: 'uuid', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/projects/columns/organization_id',
          value: { name: 'organization_id', type: 'uuid', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/projects/columns/name',
          value: { name: 'name', type: 'varchar(255)', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/projects/columns/description',
          value: { name: 'description', type: 'text' },
        },
        {
          op: 'add',
          path: '/tables/projects/columns/status',
          value: {
            name: 'status',
            type: 'varchar(50)',
            notNull: true,
            default: 'active',
          },
        },
        {
          op: 'add',
          path: '/tables/projects/columns/visibility',
          value: {
            name: 'visibility',
            type: 'varchar(20)',
            notNull: true,
            default: 'private',
          },
        },
        {
          op: 'add',
          path: '/tables/projects/columns/created_by',
          value: { name: 'created_by', type: 'uuid', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/projects/columns/created_at',
          value: { name: 'created_at', type: 'timestamp', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/projects/columns/updated_at',
          value: { name: 'updated_at', type: 'timestamp', notNull: true },
        },
        {
          op: 'add',
          path: '/tables/projects/constraints/pk_projects',
          value: { type: 'primary_key', columns: ['id'] },
        },
        {
          op: 'add',
          path: '/tables/projects/constraints/fk_project_org',
          value: {
            type: 'foreign_key',
            columns: ['organization_id'],
            references: { table: 'organizations', columns: ['id'] },
          },
        },
        {
          op: 'add',
          path: '/tables/projects/constraints/fk_created_by',
          value: {
            type: 'foreign_key',
            columns: ['created_by'],
            references: { table: 'users', columns: ['id'] },
          },
        },
        {
          op: 'add',
          path: '/tables/projects/indexes/idx_org_projects',
          value: { columns: ['organization_id'] },
        },
        {
          op: 'add',
          path: '/tables/projects/indexes/idx_status',
          value: { columns: ['status'] },
        },
      ],
    }),
  },
}

const saveRequirementsCall: ToolCallsType[number] = {
  id: 'call_2',
  type: 'function',
  index: 1,
  function: {
    name: 'saveRequirementsToArtifactTool',
    arguments: JSON.stringify({
      businessRequirement:
        'Build a comprehensive user management system with authentication, authorization, profile management, and administrative features',
      functionalRequirements: {
        'User Registration': [
          'New registration with email and password',
          'Email verification with token expiration',
          'Encrypted password storage using bcrypt',
          'Profile completion wizard',
          'Social media authentication (OAuth 2.0)',
          'Two-factor authentication setup',
          'Terms of service acceptance tracking',
          'GDPR compliance for data collection',
        ],
        'Login Function': [
          'Login with email and password',
          'Session management with JWT tokens',
          'Remember Me feature with secure cookies',
          'Login history tracking',
          'Failed login attempt monitoring',
          'Account lockout after multiple failures',
          'Password reset via email',
          'Magic link authentication option',
        ],
        'User Profile': [
          'View and edit personal information',
          'Avatar upload with image processing',
          'Privacy settings management',
          'Notification preferences',
          'Connected devices management',
          'Activity log viewing',
          'Data export functionality',
          'Account deletion with grace period',
        ],
        Authorization: [
          'Role-based access control (RBAC)',
          'Permission management system',
          'Resource-level permissions',
          'API key generation and management',
          'OAuth scope management',
          'Delegation capabilities',
        ],
        'Admin Panel': [
          'User list with advanced filtering',
          'User detail view and editing',
          'Bulk user operations',
          'Role and permission assignment',
          'System audit logs',
          'Analytics dashboard',
          'User impersonation for support',
        ],
      },
      nonFunctionalRequirements: {
        Security: [
          'Enforce HTTPS communication',
          'SQL injection prevention',
          'XSS prevention',
          'CSRF protection',
          'Rate limiting implementation',
          'Security headers configuration',
          'Content Security Policy',
          'Regular security audits',
        ],
        Performance: [
          'Login process within 1 second',
          '1000 concurrent users support',
          'Page load time under 3 seconds',
          'API response time under 500ms',
          'Database query optimization',
          'CDN implementation for static assets',
          'Caching strategy implementation',
        ],
        Scalability: [
          'Horizontal scaling capability',
          'Database sharding support',
          'Microservices architecture',
          'Message queue integration',
          'Load balancing configuration',
        ],
        Reliability: [
          '99.9% uptime SLA',
          'Automated backup system',
          'Disaster recovery plan',
          'Graceful degradation',
          'Circuit breaker pattern',
        ],
      },
    }),
  },
}

const saveTestcasesCall: ToolCallsType[number] = {
  id: 'call_3',
  type: 'function',
  index: 2,
  function: {
    name: 'saveTestcasesAndDmlTool',
    arguments: JSON.stringify({
      testcasesWithDml: [
        {
          name: 'User Registration Test',
          description: 'Verify that new users can register successfully',
          dmlOperations: [
            {
              sql: "INSERT INTO users (id, email, password) VALUES ('123', 'test@example.com', 'hashed_password')",
              type: 'insert',
            },
          ],
        },
        {
          name: 'Login Test',
          description: 'Verify that existing users can login successfully',
          dmlOperations: [
            {
              sql: "SELECT * FROM users WHERE email = 'test@example.com'",
              type: 'select',
            },
          ],
        },
      ],
    }),
  },
}

const saveTestcaseCall: ToolCallsType[number] = {
  id: 'call_4',
  type: 'function',
  index: 3,
  function: {
    name: 'saveTestcase',
    arguments: JSON.stringify({
      name: 'User Profile Update Test',
      description: 'Verify that users can update their profile information',
      dmlOperation: {
        sql: "UPDATE users SET first_name = 'John', last_name = 'Doe' WHERE id = '123'",
        type: 'update',
      },
    }),
  },
}

const runTestCall: ToolCallsType[number] = {
  id: 'call_5',
  type: 'function',
  index: 4,
  function: {
    name: 'runTestTool',
    arguments: JSON.stringify({
      testIds: ['test_1', 'test_2', 'test_3'],
    }),
  },
}

// Individual tool stories
export const SchemaDesign: Story = {
  name: 'Schema Design Tool',
  args: {
    toolCallsWithMessages: [
      {
        toolCall: schemaDesignCall,
        toolMessage: undefined, // Use default message: "Tool execution completed."
      },
    ],
    isStreaming: true,
  },
}

export const SaveRequirements: Story = {
  name: 'Save Requirements Tool',
  args: {
    toolCallsWithMessages: [
      {
        toolCall: saveRequirementsCall,
        toolMessage: undefined, // Use default message: "Tool execution completed."
      },
    ],
    isStreaming: true,
  },
}

export const SaveTestcases: Story = {
  name: 'Save Testcases and DML Tool',
  args: {
    toolCallsWithMessages: [
      {
        toolCall: saveTestcasesCall,
        toolMessage: undefined, // Use default message: "Tool execution completed."
      },
    ],
    isStreaming: true,
  },
}

export const SaveSingleTestcase: Story = {
  name: 'Save Single Testcase',
  args: {
    toolCallsWithMessages: [
      {
        toolCall: saveTestcaseCall,
        toolMessage: undefined, // Use default message: "Tool execution completed."
      },
    ],
    isStreaming: true,
  },
}

export const RunTest: Story = {
  name: 'Run Test Tool',
  args: {
    toolCallsWithMessages: [
      {
        toolCall: runTestCall,
        toolMessage: undefined, // Use default message: "Tool execution completed."
      },
    ],
    isStreaming: true,
  },
}

// Static/Completed versions for reload behavior testing
export const AllToolsCompleted: Story = {
  name: 'All Tools (Completed - Reload Behavior)',
  args: {
    toolCallsWithMessages: [
      {
        toolCall: schemaDesignCall,
        toolMessage: undefined, // Use default message: "Tool execution completed."
      },
      {
        toolCall: saveRequirementsCall,
        toolMessage: undefined, // Use default message: "Tool execution completed."
      },
      {
        toolCall: saveTestcasesCall,
        toolMessage: undefined, // Use default message: "Tool execution completed."
      },
      {
        toolCall: saveTestcaseCall,
        toolMessage: undefined, // Use default message: "Tool execution completed."
      },
      {
        toolCall: runTestCall,
        toolMessage: undefined, // Use default message: "Tool execution completed."
      },
    ],
    isStreaming: false,
  },
}

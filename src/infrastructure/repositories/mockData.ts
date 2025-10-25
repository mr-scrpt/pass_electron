/**
 * Mock данные для Repository (in-memory storage)
 * 
 * Простые объекты (DTO-like), БЕЗ Domain классов
 * Имитирует данные из API/Database
 */

export interface ResourceData {
  id: string;
  namespace: string;
  name: string;
  secret: string;
  createdAt: string;
  updatedAt: string;
}

export const mockResourcesData: ResourceData[] = [
  // Social
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    namespace: "social",
    name: "Facebook",
    secret: "facebook-password-123",
    createdAt: "2025-01-20T10:00:00.000Z",
    updatedAt: "2025-01-20T10:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    namespace: "social",
    name: "Twitter",
    secret: "twitter-password-456",
    createdAt: "2025-01-20T11:00:00.000Z",
    updatedAt: "2025-01-20T11:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    namespace: "social",
    name: "Instagram",
    secret: "instagram-password-789",
    createdAt: "2025-01-20T12:00:00.000Z",
    updatedAt: "2025-01-20T12:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    namespace: "social",
    name: "LinkedIn",
    secret: "linkedin-password-def",
    createdAt: "2025-01-20T13:00:00.000Z",
    updatedAt: "2025-01-20T13:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    namespace: "social",
    name: "Reddit",
    secret: "reddit-password-ghi",
    createdAt: "2025-01-20T14:00:00.000Z",
    updatedAt: "2025-01-20T14:00:00.000Z",
  },
  // Work
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    namespace: "work",
    name: "Jira",
    secret: "jira-password-abc",
    createdAt: "2025-01-21T09:00:00.000Z",
    updatedAt: "2025-01-21T09:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    namespace: "work",
    name: "Slack",
    secret: "slack-password-def",
    createdAt: "2025-01-21T10:00:00.000Z",
    updatedAt: "2025-01-21T10:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    namespace: "work",
    name: "GitHub",
    secret: "github-password-ghi",
    createdAt: "2025-01-21T11:00:00.000Z",
    updatedAt: "2025-01-21T11:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    namespace: "work",
    name: "GitLab",
    secret: "gitlab-password-jkl",
    createdAt: "2025-01-21T12:00:00.000Z",
    updatedAt: "2025-01-21T12:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    namespace: "work",
    name: "Notion",
    secret: "notion-password-mno",
    createdAt: "2025-01-21T13:00:00.000Z",
    updatedAt: "2025-01-21T13:00:00.000Z",
  },
  // Email
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    namespace: "email",
    name: "Gmail Personal",
    secret: "gmail-personal-password-pqr",
    createdAt: "2025-01-22T08:00:00.000Z",
    updatedAt: "2025-01-22T08:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    namespace: "email",
    name: "Gmail Work",
    secret: "gmail-work-password-stu",
    createdAt: "2025-01-22T09:00:00.000Z",
    updatedAt: "2025-01-22T09:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440013",
    namespace: "email",
    name: "Outlook",
    secret: "outlook-password-vwx",
    createdAt: "2025-01-22T10:00:00.000Z",
    updatedAt: "2025-01-22T10:00:00.000Z",
  },
  // Banking
  {
    id: "550e8400-e29b-41d4-a716-446655440014",
    namespace: "banking",
    name: "PayPal",
    secret: "paypal-password-yz1",
    createdAt: "2025-01-23T10:00:00.000Z",
    updatedAt: "2025-01-23T10:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440015",
    namespace: "banking",
    name: "Wise",
    secret: "wise-password-234",
    createdAt: "2025-01-23T11:00:00.000Z",
    updatedAt: "2025-01-23T11:00:00.000Z",
  },
];

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  tags: string[];
  author: string;
}

export const posts: BlogPost[] = [
  // Posts will be added here as they are written.
  // Example structure:
  // {
  //   slug: 'why-your-agents-md-matters',
  //   title: 'Why your AGENTS.md is the most important file in your repo',
  //   description: 'Most teams spend hours on system prompts and zero minutes on the context file their agent reads first.',
  //   date: '2026-06-15',
  //   readingTime: '5 min read',
  //   tags: ['AGENTS.md', 'AI agents', 'best practices'],
  //   author: 'MDPilot team',
  // },
];

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const USER_1_ID = 'a1111111-1111-1111-1111-111111111111';
const USER_2_ID = 'b2222222-2222-2222-2222-222222222222';
const USER_3_ID = 'c3333333-3333-3333-3333-333333333333';

const testUsers = [
  {
    id: USER_1_ID,
    email: 'admin@meetmind.com',
    password: 'password123',
    full_name: 'Admin User',
  },
  {
    id: USER_2_ID,
    email: 'sarah@meetmind.com',
    password: 'password123',
    full_name: 'Sarah Johnson',
  },
  {
    id: USER_3_ID,
    email: 'john@meetmind.com',
    password: 'password123',
    full_name: 'John Smith',
  },
];

async function createTestUsers() {
  console.log('Creating test users...');

  for (const user of testUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name },
    });

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log(`  User ${user.email} already exists`);
      } else {
        console.error(`  Error creating ${user.email}:`, error.message);
      }
    } else {
      console.log(`  Created user: ${user.email}`);
    }
  }
}

async function seedMeetings() {
  console.log('\nCreating meetings...');

  const { data: users } = await supabase
    .from('users')
    .select('id')
    .order('created_at')
    .limit(3);

  if (!users || users.length === 0) {
    console.error('No users found. Please create users first.');
    return null;
  }

  const userId1 = users[0]?.id;
  const userId2 = users[1]?.id || userId1;
  const userId3 = users[2]?.id || userId1;

  const meetings = [
    {
      owner_id: userId1,
      title: 'Q2 Renewal — Northwind',
      description: 'Quarterly renewal discussion with Northwind Logistics. Review contract terms, pricing, and SLA.',
      scheduled_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      owner_id: userId1,
      title: 'Discovery — Contoso Security',
      description: 'Initial discovery call with Contoso to understand their security requirements.',
      scheduled_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      owner_id: userId2,
      title: 'Demo — Alpine Expansion',
      description: 'Product demonstration for Alpine Energy focusing on expansion features.',
      scheduled_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      owner_id: userId2,
      title: 'Executive Review — Globex',
      description: 'Executive-level review meeting with Globex leadership team.',
      scheduled_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      owner_id: userId3,
      title: 'Follow-up — TechCorp',
      description: 'Follow-up meeting to discuss implementation timeline.',
      scheduled_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const { data: createdMeetings, error } = await supabase
    .from('meetings')
    .insert(meetings)
    .select();

  if (error) {
    console.error('Error creating meetings:', error.message);
    return null;
  }

  console.log(`  Created ${createdMeetings.length} meetings`);
  return { meetings: createdMeetings, userIds: { userId1, userId2, userId3 } };
}

async function seedRecordings(meetingIds: string[], userIds: { userId1: string; userId2: string }) {
  console.log('\nCreating recordings...');

  const recordings = [
    {
      meeting_id: meetingIds[0],
      uploader_id: userIds.userId1,
      storage_path: `${userIds.userId1}/${meetingIds[0]}/northwind.mp4`,
      file_name: 'northwind-renewal.mp4',
      mime_type: 'video/mp4',
      duration_seconds: 3120,
    },
    {
      meeting_id: meetingIds[1],
      uploader_id: userIds.userId1,
      storage_path: `${userIds.userId1}/${meetingIds[1]}/contoso.mp4`,
      file_name: 'contoso-discovery.mp4',
      mime_type: 'video/mp4',
      duration_seconds: 2280,
    },
    {
      meeting_id: meetingIds[2],
      uploader_id: userIds.userId2,
      storage_path: `${userIds.userId2}/${meetingIds[2]}/alpine.mp4`,
      file_name: 'alpine-demo.mp4',
      mime_type: 'video/mp4',
      duration_seconds: 2700,
    },
    {
      meeting_id: meetingIds[3],
      uploader_id: userIds.userId2,
      storage_path: `${userIds.userId2}/${meetingIds[3]}/globex.mp4`,
      file_name: 'globex-executive.mp4',
      mime_type: 'video/mp4',
      duration_seconds: 3660,
    },
  ];

  const { data: createdRecordings, error } = await supabase
    .from('recordings')
    .insert(recordings)
    .select();

  if (error) {
    console.error('Error creating recordings:', error.message);
    return null;
  }

  console.log(`  Created ${createdRecordings.length} recordings`);
  return createdRecordings;
}

async function seedTranscriptions(recordingIds: string[]) {
  console.log('\nCreating transcriptions...');

  const transcriptions = [
    {
      recording_id: recordingIds[0],
      language: 'en',
      text: `Michael:
Welcome everyone to our Q2 renewal discussion with Northwind Logistics.

Rachel:
Thank you Michael. We are proposing a 15% price increase to reflect enhanced services.

Kevin:
The extended support hours have been valuable. We want those in the new contract.

Michael:
We can include 24/7 support in the premium tier. Let us discuss the reporting features.

Rachel:
The new dashboard gives real-time visibility into all metrics.

Kevin:
We will need time to review this internally.

Michael:
Take the time you need. We will send the proposal by end of week.`,
    },
    {
      recording_id: recordingIds[1],
      language: 'en',
      text: `Daniel:
Thank you for joining this discovery call about Contoso security requirements.

Amanda:
Our main concern is data encryption. We have legacy systems without modern security.

Daniel:
Can you tell me more about your current infrastructure?

Amanda:
We have on-premise servers with basic access controls. Data is not encrypted at rest.

Daniel:
That is a significant risk. Have you considered cloud migration?

Amanda:
Yes, we need enhanced security protocols and compliance.

Daniel:
Let me schedule a technical deep-dive session.`,
    },
    {
      recording_id: recordingIds[2],
      language: 'en',
      text: `James:
Good morning. Today I will demonstrate our expansion features for Alpine Energy.

Sophie:
We are interested in multi-region deployment. Can the system handle that?

James:
Absolutely. We support multi-region with automatic failover.

Sophie:
What about auto-scaling for variable workloads?

James:
The system auto-scales based on demand. You pay for what you use.

Sophie:
The dashboard looks intuitive.

James:
Thank you. Shall we discuss a proof of concept?

Sophie:
Yes, let us schedule a POC for next quarter.`,
    },
    {
      recording_id: recordingIds[3],
      language: 'en',
      text: `Director:
Thank you for this executive review. We are discussing partnership opportunities.

Partner Manager:
We see synergies between our organizations.

Director:
What do you propose for go-to-market strategy?

Partner Manager:
Joint marketing and co-selling. Our teams can cross-refer leads.

Finance Lead:
What about the financial model?

Partner Manager:
We are open to revenue sharing or referral fees.

Director:
Let us have our legal teams connect.`,
    },
  ];

  const { data, error } = await supabase.from('transcriptions').insert(transcriptions).select();

  if (error) {
    console.error('Error creating transcriptions:', error.message);
    return;
  }

  console.log(`  Created ${data.length} transcriptions`);
}

async function seedAiSummaries(meetingIds: string[]) {
  console.log('\nCreating AI summaries...');

  const summaries = [
    {
      meeting_id: meetingIds[0],
      summary: 'Q2 renewal discussion with Northwind covered contract terms and pricing. A 15% price increase was proposed. Extended support hours and enhanced reporting were discussed.',
      action_items: [
        { title: 'Send proposal by end of week', owner: 'Michael', deadline: null },
        { title: 'Review pricing with finance', owner: 'Rachel', deadline: null },
        { title: 'Prepare SLA documentation', owner: 'Legal', deadline: null },
      ],
      decisions: ['15% price increase pending approval', '24/7 support included in premium tier', 'Quarterly business reviews mandatory'],
      key_points: ['Contract renewal for Q2', '15% price increase proposed', 'Extended support hours requested', 'Enhanced reporting features', 'Client needs review time'],
      keywords: ['renewal', 'pricing', 'SLA', 'Northwind', 'Q2', 'support'],
    },
    {
      meeting_id: meetingIds[1],
      summary: 'Discovery call with Contoso revealed security concerns around encryption and access controls. They use legacy systems and are interested in cloud migration.',
      action_items: [
        { title: 'Schedule technical deep-dive', owner: 'Daniel', deadline: null },
        { title: 'Prepare security assessment', owner: 'Security Team', deadline: null },
        { title: 'Create migration roadmap', owner: 'Architect', deadline: null },
      ],
      decisions: ['Cloud migration preferred', 'Security audit to be conducted', 'Compliance requirements critical'],
      key_points: ['Legacy systems lacking encryption', 'Data not encrypted at rest', 'Basic access controls', 'Cloud solution preferred', 'Compliance is critical'],
      keywords: ['security', 'encryption', 'cloud', 'migration', 'Contoso', 'compliance'],
    },
    {
      meeting_id: meetingIds[2],
      summary: 'Product demo for Alpine Energy showcased expansion features. Multi-region deployment and auto-scaling were highlights. Client wants to proceed with POC.',
      action_items: [
        { title: 'Schedule POC for Q3', owner: 'James', deadline: null },
        { title: 'Send multi-region pricing', owner: 'Sales', deadline: null },
        { title: 'Provide case studies', owner: 'Marketing', deadline: null },
      ],
      decisions: ['POC scheduled for Q3', 'Multi-region deployment required', 'Auto-scaling is essential'],
      key_points: ['Multi-region deployment shown', 'Auto-scaling based on demand', 'Clean dashboard UI', 'Pay-per-use pricing', 'POC agreed'],
      keywords: ['demo', 'scalability', 'multi-region', 'Alpine', 'POC', 'auto-scaling'],
    },
    {
      meeting_id: meetingIds[3],
      summary: 'Executive review with Globex explored partnership opportunities. Joint go-to-market strategies and revenue sharing were discussed.',
      action_items: [
        { title: 'Connect legal teams', owner: 'Director', deadline: null },
        { title: 'Draft partnership proposal', owner: 'Partner Manager', deadline: null },
        { title: 'Define revenue model', owner: 'Finance Lead', deadline: null },
      ],
      decisions: ['Partnership to proceed', 'Legal teams to connect', 'Revenue model to be defined'],
      key_points: ['Strategic partnership discussed', 'Go-to-market synergies', 'Co-selling opportunities', 'Revenue sharing options', 'Executive buy-in achieved'],
      keywords: ['partnership', 'executive', 'Globex', 'strategy', 'revenue', 'marketing'],
    },
    {
      meeting_id: meetingIds[4],
      summary: 'Follow-up with TechCorp discussed implementation timeline. Project kickoff scheduled for next month.',
      action_items: [
        { title: 'Finalize timeline', owner: 'Project Lead', deadline: null },
        { title: 'Allocate resources', owner: 'Operations Manager', deadline: null },
        { title: 'Schedule kickoff', owner: 'Account Executive', deadline: null },
      ],
      decisions: ['Kickoff next month', 'Resources allocated by week end', 'Weekly updates agreed'],
      key_points: ['Implementation timeline reviewed', 'Resource allocation discussed', 'Milestone planning done', 'Kickoff to be scheduled'],
      keywords: ['implementation', 'TechCorp', 'timeline', 'kickoff', 'resources'],
    },
  ];

  const { data, error } = await supabase.from('ai_summaries').insert(summaries).select();

  if (error) {
    console.error('Error creating AI summaries:', error.message);
    return;
  }

  console.log(`  Created ${data.length} AI summaries`);
}

async function seedTasks(meetingIds: string[], userIds: { userId1: string; userId2: string; userId3: string }) {
  console.log('\nCreating tasks...');

  const tasks = [
    { meeting_id: meetingIds[0], title: 'Send proposal by end of week', assigned_to: userIds.userId1, status: 'done', deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { meeting_id: meetingIds[0], title: 'Review pricing with finance', assigned_to: userIds.userId1, status: 'doing', deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
    { meeting_id: meetingIds[0], title: 'Prepare SLA documentation', assigned_to: userIds.userId1, status: 'todo', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
    { meeting_id: meetingIds[1], title: 'Schedule technical deep-dive', assigned_to: userIds.userId1, status: 'done', deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { meeting_id: meetingIds[1], title: 'Prepare security assessment', assigned_to: userIds.userId1, status: 'doing', deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
    { meeting_id: meetingIds[2], title: 'Schedule POC for Q3', assigned_to: userIds.userId2, status: 'doing', deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
    { meeting_id: meetingIds[2], title: 'Send multi-region pricing', assigned_to: userIds.userId2, status: 'done', deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { meeting_id: meetingIds[3], title: 'Connect legal teams', assigned_to: userIds.userId2, status: 'todo', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
    { meeting_id: meetingIds[3], title: 'Draft partnership proposal', assigned_to: userIds.userId2, status: 'doing', deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() },
    { meeting_id: meetingIds[4], title: 'Finalize timeline', assigned_to: userIds.userId3, status: 'todo', deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
    { meeting_id: meetingIds[4], title: 'Schedule kickoff meeting', assigned_to: userIds.userId3, status: 'todo', deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  const { data, error } = await supabase.from('tasks').insert(tasks).select();

  if (error) {
    console.error('Error creating tasks:', error.message);
    return;
  }

  console.log(`  Created ${data.length} tasks`);
}

async function main() {
  console.log('MeetMind Database Seeding');
  console.log('========================================\n');

  try {
    await createTestUsers();

    const meetingResult = await seedMeetings();
    if (!meetingResult) {
      console.error('Failed to create meetings. Aborting.');
      process.exit(1);
    }

    const meetingIds = meetingResult.meetings.map((m) => m.id);
    const { userId1, userId2, userId3 } = meetingResult.userIds;

    const recordings = await seedRecordings(meetingIds, { userId1, userId2 });
    if (!recordings) {
      console.error('Failed to create recordings. Continuing without transcriptions.');
    } else {
      const recordingIds = recordings.map((r) => r.id);
      await seedTranscriptions(recordingIds);
    }

    await seedAiSummaries(meetingIds);
    await seedTasks(meetingIds, { userId1, userId2, userId3 });

    console.log('\n========================================');
    console.log('SEED COMPLETED SUCCESSFULLY');
    console.log('========================================');
    console.log('\nTest Users (Password: password123):');
    console.log('   - admin@meetmind.com');
    console.log('   - sarah@meetmind.com');
    console.log('   - john@meetmind.com');
    console.log('\nCreated:');
    console.log('   - 3 Users');
    console.log('   - 5 Meetings');
    console.log('   - 4 Recordings');
    console.log('   - 4 Transcriptions');
    console.log('   - 5 AI Summaries');
    console.log('   - 11 Tasks');
    console.log('========================================\n');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

main();

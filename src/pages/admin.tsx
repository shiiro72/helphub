import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { Navbar } from '@/components/organisms/Navbar';
import { createClient } from '@/lib/supabase/client';
import { Report, SupportTicket, Profile, BannedUser } from '@/lib/types';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import { User, Flag, MessageSquare, Clock, CheckCircle, Shield, Ban, Mail } from 'lucide-react';
import { useToast } from '@/lib/contexts/ToastContext';
import { Button } from '@/components/atoms/Button';

export default function AdminPage() {
  const t = useTranslations();
  const router = useRouter();
  const { showToast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [flaggedUsers, setFlaggedUsers] = useState<Profile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'tickets' | 'banned' | 'flagged' | 'users'>(
    'reports',
  );
  const [supabase] = useState(() => createClient());

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      router.push('/');
      return;
    }

    // Fetch reports with profiles
    const { data: reportsData } = await supabase
      .from('reports')
      .select(
        `
        *,
        reporter:profiles!reporter_id(*),
        reported:profiles!reported_id(*)
      `,
      )
      .order('created_at', { ascending: false });

    // Fetch support tickets with profiles
    const { data: ticketsData } = await supabase
      .from('support_tickets')
      .select(
        `
        *,
        profiles(*)
      `,
      )
      .order('created_at', { ascending: false });

    // Fetch banned users
    const { data: bannedData } = await supabase
      .from('archived_users')
      .select('*')
      .order('banned_at', { ascending: false });

    // Fetch flagged (restricted) users
    const { data: flaggedData } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_restricted', true)
      .order('created_at', { ascending: false });

    // Fetch all users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    setReports(reportsData || []);
    setTickets(ticketsData || []);
    setBannedUsers(bannedData || []);
    setFlaggedUsers(flaggedData || []);
    setAllUsers(usersData || []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBanUser = async (userId: string, reason: string) => {
    if (!confirm(t('confirm_ban_user'))) return;

    const { error } = await supabase.rpc('ban_user', {
      target_user_id: userId,
      ban_reason: reason,
    });

    if (error) {
      showToast(t('error_banning_user'), 'error');
      console.error(error);
    } else {
      showToast(t('user_banned_success'), 'success');
      fetchData();
    }
  };

  const handleUnrestrictUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_restricted: false })
      .eq('id', userId);

    if (error) {
      showToast(t('error_unrestricting_user'), 'error');
    } else {
      showToast(t('user_unrestricted_success'), 'success');
      fetchData();
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: 'open' | 'closed') => {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status: newStatus })
      .eq('id', ticketId);

    if (error) {
      showToast(t('error_updating_ticket'), 'error');
    } else {
      showToast(t('ticket_status_updated'), 'success');
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)));
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    const { error } = await supabase.from('reports').delete().eq('id', reportId);
    if (error) {
      showToast(t('error_deleting_report'), 'error');
    } else {
      showToast(t('report_deleted'), 'success');
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    }
  };

  return (
    <div className="min-h-screen bg-brand-background">
      <Head>
        <title>{`${t('admin_board')} | HelpHub`}</title>
      </Head>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-brand-success/10 rounded-lg">
            <Shield className="text-brand-success" size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-text-main">
            {t('admin_board')}
          </h1>
        </div>

        <div className="flex gap-4 border-b border-brand-border mb-6">
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'reports'
                ? 'text-brand-success'
                : 'text-brand-text-secondary hover:text-brand-text-main'
            }`}
          >
            <div className="flex items-center gap-2">
              <Flag size={18} />
              {t('reports')}
              <span className="ml-1 px-2 py-0.5 text-xs bg-brand-surface-container-low rounded-full">
                {reports.length}
              </span>
            </div>
            {activeTab === 'reports' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-success" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'tickets'
                ? 'text-brand-success'
                : 'text-brand-text-secondary hover:text-brand-text-main'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={18} />
              {t('support_tickets')}
              <span className="ml-1 px-2 py-0.5 text-xs bg-brand-surface-container-low rounded-full">
                {tickets.length}
              </span>
            </div>
            {activeTab === 'tickets' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-success" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('banned')}
            className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'banned'
                ? 'text-brand-success'
                : 'text-brand-text-secondary hover:text-brand-text-main'
            }`}
          >
            <div className="flex items-center gap-2">
              <Ban size={18} />
              {t('banned_users')}
              <span className="ml-1 px-2 py-0.5 text-xs bg-brand-surface-container-low rounded-full">
                {bannedUsers.length}
              </span>
            </div>
            {activeTab === 'banned' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-success" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'flagged'
                ? 'text-brand-success'
                : 'text-brand-text-secondary hover:text-brand-text-main'
            }`}
          >
            <div className="flex items-center gap-2">
              <Flag size={18} />
              {t('flagged_users')}
              <span className="ml-1 px-2 py-0.5 text-xs bg-brand-surface-container-low rounded-full">
                {flaggedUsers.length}
              </span>
            </div>
            {activeTab === 'flagged' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-success" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'users'
                ? 'text-brand-success'
                : 'text-brand-text-secondary hover:text-brand-text-main'
            }`}
          >
            <div className="flex items-center gap-2">
              <User size={18} />
              {t('users')}
              <span className="ml-1 px-2 py-0.5 text-xs bg-brand-surface-container-low rounded-full">
                {allUsers.length}
              </span>
            </div>
            {activeTab === 'users' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-success" />
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-success"></div>
          </div>
        ) : activeTab === 'reports' ? (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="text-center py-12 text-brand-text-secondary">{t('no_reports')}</div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-brand-surface-container-lowest border border-brand-border rounded-xl p-5 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="grow">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex flex-col">
                          <span className="text-xs text-brand-text-secondary uppercase tracking-wider font-bold">
                            {t('reporter')}
                          </span>
                          <span className="font-medium text-brand-text-main">
                            {report.reporter?.username || 'Unknown'}
                          </span>
                        </div>
                        <div className="h-8 w-px bg-brand-border" />
                        <div className="flex flex-col">
                          <span className="text-xs text-brand-text-secondary uppercase tracking-wider font-bold">
                            {t('reported_user')}
                          </span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            {report.reported?.username || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className="bg-brand-surface-container-low p-4 rounded-lg border border-brand-border/40">
                        <p className="text-brand-text-main italic">"{report.reason}"</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 gap-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-brand-text-secondary"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          {t('delete')}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-brand-error text-brand-on-error hover:bg-brand-error/90 border-none shadow-sm"
                          onClick={() => handleBanUser(report.reported_id, report.reason)}
                        >
                          <Ban size={16} className="mr-2" />
                          {t('ban_user')}
                        </Button>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-brand-text-secondary mb-2">
                        <Clock size={14} />
                        {new Date(report.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'tickets' ? (
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="text-center py-12 text-brand-text-secondary">{t('no_tickets')}</div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-brand-surface-container-lowest border border-brand-border rounded-xl p-5 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="grow">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-brand-text-main">
                          {ticket.subject}
                        </h3>
                        <span
                          className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${
                            ticket.status === 'open'
                              ? 'bg-blue-50 text-blue-600 border-blue-100'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-brand-text-secondary mb-4">
                        <User size={14} />
                        {ticket.profiles?.username || 'Unknown'}
                        <span className="mx-1">•</span>
                        <Clock size={14} />
                        {new Date(ticket.created_at).toLocaleString()}
                      </div>
                      <p className="text-brand-text-main bg-brand-surface-container-low p-4 rounded-lg border border-brand-border/40">
                        {ticket.message}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {ticket.status === 'open' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'closed')}
                          className="w-full"
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Close Ticket
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'open')}
                          className="w-full"
                        >
                          <Clock size={16} className="mr-2" />
                          Reopen Ticket
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'banned' ? (
          <div className="space-y-4">
            {bannedUsers.length === 0 ? (
              <div className="text-center py-12 text-brand-text-secondary">{t('no_banned_users')}</div>
            ) : (
              bannedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-brand-surface-container-lowest border border-brand-border rounded-xl p-5 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Ban className="text-red-500" size={18} />
                        <span className="font-bold text-brand-text-main">
                          {user.username || 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
                        <Mail size={14} />
                        {user.email}
                      </div>
                      <div className="mt-2 text-sm text-brand-text-secondary bg-brand-surface-container-low p-3 rounded border border-brand-border/40">
                        <span className="font-medium mr-1">{t('reason')}:</span>
                        {user.reason || t('no_reason_provided')}
                      </div>
                    </div>
                    <div className="flex flex-col items-end text-xs text-brand-text-secondary">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(user.banned_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'flagged' ? (
          <div className="space-y-4">
            {flaggedUsers.length === 0 ? (
              <div className="text-center py-12 text-brand-text-secondary">{t('no_flagged_users')}</div>
            ) : (
              flaggedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-brand-surface-container-lowest border border-brand-border rounded-xl p-5 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-surface-container-high flex items-center justify-center overflow-hidden">
                        <User size={24} className="text-brand-text-secondary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-text-main">
                          {user.username}
                        </span>
                        <span className="text-xs text-red-500 font-medium uppercase tracking-wider">
                          {t('automatically_restricted')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnrestrictUser(user.id)}
                      >
                        <CheckCircle size={16} className="mr-2" />
                        {t('unrestrict_user')}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-brand-error text-brand-on-error hover:bg-brand-error/90 border-none shadow-sm"
                        onClick={() => handleBanUser(user.id, 'Repeatedly reported & flagged')}
                      >
                        <Ban size={16} className="mr-2" />
                        {t('ban_user')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {allUsers.length === 0 ? (
              <div className="text-center py-12 text-brand-text-secondary">{t('no_users')}</div>
            ) : (
              allUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-brand-surface-container-lowest border border-brand-border rounded-xl p-5 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-surface-container-high flex items-center justify-center overflow-hidden">
                        <User size={24} className="text-brand-text-secondary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-text-main">
                          {user.username}
                        </span>
                        <span className="text-xs text-brand-text-secondary">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/messages?userId=${user.id}`)}
                      >
                        <MessageSquare size={16} className="mr-2" />
                        {t('message')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    messages: (await import(`../../messages/${locale ?? 'en'}.json`)).default,
  },
});

import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { Navbar } from '@/components/organisms/Navbar';
import { createClient } from '@/lib/supabase/client';
import { Report, SupportTicket, Profile, BannedUser } from '@/lib/types';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import { User, Flag, MessageSquare, Clock, CheckCircle, Shield, Ban, Mail } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

export default function AdminPage() {
  const t = useTranslations();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'tickets' | 'banned'>('reports');
  const [supabase] = useState(() => createClient());

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
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
      .select(`
        *,
        reporter:profiles!reporter_id(*),
        reported:profiles!reported_id(*)
      `)
      .order('created_at', { ascending: false });

    // Fetch support tickets with profiles
    const { data: ticketsData } = await supabase
      .from('support_tickets')
      .select(`
        *,
        profiles(*)
      `)
      .order('created_at', { ascending: false });

    // Fetch banned users
    const { data: bannedData } = await supabase
      .from('archived_users')
      .select('*')
      .order('banned_at', { ascending: false });

    setReports(reportsData || []);
    setTickets(ticketsData || []);
    setBannedUsers(bannedData || []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBanUser = async (userId: string, reason: string) => {
    if (!confirm(t('confirm_ban_user'))) return;

    const { error } = await supabase.rpc('ban_user', {
      target_user_id: userId,
      ban_reason: reason
    });

    if (error) {
      alert(t('error_banning_user'));
      console.error(error);
    } else {
      alert(t('user_banned_success'));
      fetchData();
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: 'open' | 'closed') => {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status: newStatus })
      .eq('id', ticketId);

    if (error) {
      alert(t('error_updating_ticket'));
    } else {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Head>
        <title>{`${t('admin_board')} | HelpHub`}</title>
      </Head>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-brand-success/10 rounded-lg">
            <Shield className="text-brand-success" size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t('admin_board')}
          </h1>
        </div>

        <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800 mb-6">
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'reports'
                ? 'text-brand-success'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Flag size={18} />
              {t('reports')}
              <span className="ml-1 px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-full">
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
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={18} />
              {t('support_tickets')}
              <span className="ml-1 px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-full">
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
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Ban size={18} />
              {t('banned_users')}
              <span className="ml-1 px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-full">
                {bannedUsers.length}
              </span>
            </div>
            {activeTab === 'banned' && (
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
              <div className="text-center py-12 text-zinc-500">
                {t('no_reports')}
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex flex-col">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">
                            {t('reporter')}
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {report.reporter?.username || 'Unknown'}
                          </span>
                        </div>
                        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
                        <div className="flex flex-col">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">
                            {t('reported_user')}
                          </span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            {report.reported?.username || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        <p className="text-zinc-700 dark:text-zinc-300 italic">
                          "{report.reason}"
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border-red-100 dark:border-red-900"
                        onClick={() => handleBanUser(report.reported_id, report.reason)}
                      >
                        <Ban size={16} className="mr-2" />
                        {t('ban_user')}
                      </Button>
                      <div className="flex items-center gap-1 text-xs text-zinc-500 mb-2">
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
              <div className="text-center py-12 text-zinc-500">
                {t('no_tickets')}
              </div>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                         <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                           {ticket.subject}
                         </h3>
                         <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${
                           ticket.status === 'open'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                         }`}>
                           {ticket.status}
                         </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
                        <User size={14} />
                        {ticket.profiles?.username || 'Unknown'}
                        <span className="mx-1">•</span>
                        <Clock size={14} />
                        {new Date(ticket.created_at).toLocaleString()}
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
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
        ) : (
          <div className="space-y-4">
            {bannedUsers.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                {t('no_banned_users')}
              </div>
            ) : (
              bannedUsers.map((user) => (
                <div key={user.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <Ban className="text-red-500" size={18} />
                           <span className="font-bold text-zinc-900 dark:text-zinc-100">
                             {user.username || 'Anonymous'}
                           </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                           <Mail size={14} />
                           {user.email}
                        </div>
                        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-100 dark:border-zinc-800">
                           <span className="font-medium mr-1">{t('reason')}:</span>
                           {user.reason || t('no_reason_provided')}
                        </div>
                      </div>
                      <div className="flex flex-col items-end text-xs text-zinc-500">
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

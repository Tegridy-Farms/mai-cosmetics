'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { LeadAttributionPanel } from '@/components/leads/detail/LeadAttributionPanel';
import { LeadNoteComposer } from '@/components/leads/detail/LeadNoteComposer';
import { LeadTimeline } from '@/components/leads/detail/LeadTimeline';
import type { LeadTimelineLabels } from '@/components/leads/detail/LeadTimelineItem';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { ClientApiError, getJson, postJson, putJson } from '@/lib/api-client';
import { showToastForClientApiError } from '@/lib/api-error-toast';
import type { AttributionLabelsMap } from '@/lib/leads/event-presentation';
import { t } from '@/lib/translations';
import type { LeadEvent, LeadEventType, LeadStage } from '@/types';

type LeadDetail = {
  id: number;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  source_channel: string;
  stage: LeadStage;
  lost_reason?: string | null;
  campaign_name?: string | null;
  form_name?: string | null;
  attribution?: Record<string, unknown> | null;
  submitted_at?: string | null;
  converted_customer_id?: number | null;
};

const stageOptions: { value: LeadStage; label: string }[] = [
  { value: 'new', label: t.leads.new },
  { value: 'qualified', label: t.leads.qualified },
  { value: 'contacted', label: t.leads.contacted },
  { value: 'scheduled', label: t.leads.scheduled },
  { value: 'converted', label: t.leads.converted },
  { value: 'lost', label: t.leads.lost },
];

const stageLabelByKey: Record<LeadStage, string> = {
  new: t.leads.new,
  qualified: t.leads.qualified,
  contacted: t.leads.contacted,
  scheduled: t.leads.scheduled,
  converted: t.leads.converted,
  lost: t.leads.lost,
};

export default function MarketingLeadDetailPage() {
  const params = useParams() ?? {};
  const router = useRouter();
  const id = parseInt((params as any).id as string, 10);
  const { showToast, toasts } = useToast();

  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [stage, setStage] = useState<LeadStage>('new');
  const [note, setNote] = useState('');
  const [savingStage, setSavingStage] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [converting, setConverting] = useState(false);

  const timelineLabels: LeadTimelineLabels = useMemo(
    () => ({
      stageFlowArrow: t.leads.detail.stageFlowArrow,
      stageLabels: {
        fromNull: t.leads.detail.stageFromStart,
        ...stageLabelByKey,
      },
      unknownStage: t.leads.detail.unknownStage,
      technicalDetails: t.leads.detail.technicalDetails,
      eventTypeTitle: t.leads.detail.eventType as Record<LeadEventType, string>,
      conversionMilestone: t.leads.detail.conversionMilestone,
      conversionDeduped: t.leads.detail.conversionDeduped,
      viewCustomerCard: t.leads.detail.viewCustomerCard,
      contactAttemptBody: t.leads.detail.contactAttemptBody,
    }),
    []
  );

  const attributionLabelMap: AttributionLabelsMap = useMemo(
    () => ({ ...t.leads.attributionLabels }),
    []
  );

  useEffect(() => {
    if (isNaN(id)) return;
    let cancelled = false;
    (async () => {
      try {
        const [leadJson, evs] = await Promise.all([
          getJson<LeadDetail>(`/api/leads/${id}`),
          getJson<LeadEvent[]>(`/api/leads/${id}/events`),
        ]);
        if (!cancelled) {
          setLead(leadJson);
          setStage(leadJson.stage);
          setEvents(evs);
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ClientApiError && e.status === 404) {
          router.push('/marketing/leads');
          return;
        }
        if (e instanceof ClientApiError) {
          showToastForClientApiError(e, showToast);
        } else {
          showToast(t.toast.couldNotLoad, 'error');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router, showToast]);

  async function saveStage() {
    if (!lead) return;
    setSavingStage(true);
    try {
      await putJson(`/api/leads/${id}`, { stage });
      const [updatedLead, evs] = await Promise.all([
        getJson<LeadDetail>(`/api/leads/${id}`),
        getJson<LeadEvent[]>(`/api/leads/${id}/events`),
      ]);
      setLead(updatedLead);
      setEvents(evs);
      showToast(t.toast.saved, 'success');
    } catch (e) {
      if (e instanceof ClientApiError) {
        showToastForClientApiError(e, showToast);
      } else {
        showToast(t.toast.couldNotSave, 'error');
      }
    } finally {
      setSavingStage(false);
    }
  }

  async function addNote() {
    if (!note.trim()) return;
    setSavingNote(true);
    try {
      await postJson(`/api/leads/${id}/events`, { type: 'note', payload: { text: note.trim() } });
      setNote('');
      setEvents(await getJson<LeadEvent[]>(`/api/leads/${id}/events`));
      showToast(t.leads.noteSaved, 'success');
    } catch (e) {
      if (e instanceof ClientApiError) {
        showToastForClientApiError(e, showToast);
      } else {
        showToast(t.toast.couldNotSave, 'error');
      }
    } finally {
      setSavingNote(false);
    }
  }

  async function convertToCustomer() {
    if (!lead) return;
    setConverting(true);
    try {
      const json = await postJson<{ customer_id?: number }>(`/api/leads/${id}/convert`, {});
      const [updatedLead, evs] = await Promise.all([
        getJson<LeadDetail>(`/api/leads/${id}`),
        getJson<LeadEvent[]>(`/api/leads/${id}/events`),
      ]);
      setLead(updatedLead);
      setEvents(evs);
      showToast(t.toast.saved, 'success');
      if (json?.customer_id) {
        router.push(`/customers/${json.customer_id}`);
      }
    } catch (e) {
      if (e instanceof ClientApiError) {
        showToastForClientApiError(e, showToast);
      } else {
        showToast(t.toast.couldNotSave, 'error');
      }
    } finally {
      setConverting(false);
    }
  }

  if (isNaN(id) || isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="h-8 w-48 bg-skeleton rounded animate-pulse" />
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">{lead.full_name}</h2>
        <div className="flex items-center gap-2">
          {lead.converted_customer_id ? (
            <Link href={`/customers/${lead.converted_customer_id}`}>
              <Button variant="ghost">{t.customers.viewCustomer}</Button>
            </Link>
          ) : (
            <Button variant="primary" type="button" loading={converting} onClick={convertToCustomer}>
              {t.leads.convertToCustomer}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-text-muted">{t.leads.phone}</div>
            <div className="text-text-primary">{lead.phone || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-text-muted">{t.leads.email}</div>
            <div className="text-text-primary">{lead.email || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-text-muted">{t.leads.source}</div>
            <div className="text-text-primary">{lead.source_channel}</div>
          </div>
          <div>
            <div className="text-sm text-text-muted">{t.leads.stage}</div>
            <div className="text-text-primary">{stageLabelByKey[lead.stage] ?? lead.stage}</div>
          </div>
          <div>
            <div className="text-sm text-text-muted">{t.leads.campaign}</div>
            <div className="text-text-primary">{lead.campaign_name || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-text-muted">{t.leads.form}</div>
            <div className="text-text-primary">{lead.form_name || '—'}</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">{t.leads.updateStage}</label>
            <Select options={stageOptions} value={stage} onValueChange={(v) => setStage(v as LeadStage)} />
          </div>
          <div className="sm:col-span-2">
            <Button type="button" onClick={saveStage} loading={savingStage}>
              {t.leads.saveStage}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="space-y-4 order-1 lg:order-2">
          <LeadNoteComposer
            note={note}
            onNoteChange={setNote}
            onSubmit={addNote}
            saving={savingNote}
            labels={{
              title: t.leads.addNote,
              placeholder: t.leads.notePlaceholder,
              save: t.forms.save,
            }}
          />
          <LeadAttributionPanel
            attribution={lead.attribution}
            sectionTitle={t.leads.detail.attribution}
            labels={attributionLabelMap}
            rawExtraTitle={t.leads.detail.attributionRawExtra}
            expandValueLabel={t.leads.detail.expandValue}
          />
        </aside>

        <div className="order-2 lg:order-1 lg:col-span-2">
          <LeadTimeline
            events={events}
            sectionTitle={t.leads.detail.timeline}
            emptyMessage={t.leads.detail.noEvents}
            labels={timelineLabels}
          />
        </div>
      </div>

      <Link
        href="/marketing/leads"
        className="block mt-6 text-center text-primary underline hover:text-primary-dark text-sm"
      >
        ↩️ {t.leads.title}
      </Link>

      <ToastContainer toasts={toasts} />
    </div>
  );
}

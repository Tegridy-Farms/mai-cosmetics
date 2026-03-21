import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface LeadNoteComposerProps {
  note: string;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
  saving: boolean;
  labels: {
    title: string;
    placeholder: string;
    save: string;
  };
}

export function LeadNoteComposer({
  note,
  onNoteChange,
  onSubmit,
  saving,
  labels,
}: LeadNoteComposerProps) {
  return (
    <div className="rounded-xl border border-border bg-gradient-to-b from-primary-tint/50 to-surface p-4 shadow-sm ring-1 ring-primary/10">
      <div className="text-lg font-semibold text-text-primary mb-3">{labels.title}</div>
      <Textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder={labels.placeholder}
        rows={4}
        className="bg-surface"
      />
      <Button type="button" className="mt-3 w-full" onClick={onSubmit} loading={saving}>
        {labels.save}
      </Button>
    </div>
  );
}

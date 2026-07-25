"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PenSquare, RefreshCw, Loader2, ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { SearchBar } from "@/components/mail/search-bar";
import { InboxPanel } from "@/components/mail/inbox-panel";
import { EmailViewer } from "@/components/mail/email-viewer";
import { ComposeEmailModal } from "@/components/mail/compose-email-modal";
import { MailLoadingState } from "@/components/mail/loading-state";
import { MailEmptyState } from "@/components/mail/empty-state";
import { MailErrorState } from "@/components/mail/error-state";

import {
  getInbox,
  getSentEmails,
  searchEmails,
  getEmail,
  refreshInbox,
} from "@/lib/api/gmail";
import { getIntegrations } from "@/lib/api/integrations";
import { ApiError } from "@/lib/api/client";
import { normalizeReplyRecipient } from "@/lib/reply-recipient";
import type { EmailDetail, EmailSummary, MailView } from "@/types/gmail";

type ListState = "loading" | "ready" | "error" | "not-connected";

export default function MailPage() {
  const router = useRouter();

  const [view, setView] = useState<MailView>("inbox");
  const [emails, setEmails] = useState<EmailSummary[]>([]);
  const [listState, setListState] = useState<ListState>("loading");
  const [searching, setSearching] = useState(false);

  const [selected, setSelected] = useState<EmailDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [refreshing, setRefreshing] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [sentNotice, setSentNotice] = useState(false);

  // Auto-dismiss the "email sent" confirmation after a few seconds.
  useEffect(() => {
    if (!sentNotice) return;
    const timer = setTimeout(() => setSentNotice(false), 4000);
    return () => clearTimeout(timer);
  }, [sentNotice]);

  const loadList = useCallback(async (target: MailView) => {
    try {
      const { integrations } = await getIntegrations();
      const gmail = integrations.find((item) => item.provider === "gmail");

      setSelected(null);
      setSelectedId(null);

      if (!gmail?.connected) {
        setListState("not-connected");
        return;
      }

      const data =
        target === "inbox" ? await getInbox() : await getSentEmails();

      setEmails(data.emails);
      setListState("ready");
    } catch {
      setListState("error");
    }
  }, []);

  useEffect(() => {
    loadList("inbox");
  }, [loadList]);

  function handleViewChange(next: MailView) {
    if (next === view) {
      return;
    }
    setView(next);
    setListState("loading");
    loadList(next);
  }

  const handleSelect = useCallback(async (email: EmailSummary) => {
    setSelectedId(email.id);
    setDetailLoading(true);
    setDetailError("");

    try {
      const { email: detail } = await getEmail(email.id);
      setSelected(detail);
    } catch (error) {
      setDetailError(
        error instanceof ApiError
          ? error.message
          : "Failed to load this email."
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearching(true);
    setListState("loading");
    setSelected(null);
    setSelectedId(null);

    try {
      const data = await searchEmails(query);
      setEmails(data.emails);
      setListState("ready");
    } catch {
      setListState("error");
    } finally {
      setSearching(false);
    }
  }, []);

  const handleClearSearch = useCallback(() => {
    if (view === "inbox") {
      loadList("inbox");
    }
  }, [view, loadList]);

  async function handleRefresh() {
    setRefreshing(true);

    try {
      const data = await refreshInbox();
      setEmails(data.emails);
      setListState("ready");
    } catch {
      setListState("error");
    } finally {
      setRefreshing(false);
    }
  }

  function handleReply(email: EmailDetail) {
    setComposeTo(normalizeReplyRecipient(email.from));
    setComposeSubject(
      email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`
    );
    setComposeOpen(true);
  }

  function openCompose() {
    setComposeTo("");
    setComposeSubject("");
    setComposeOpen(true);
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-7rem)] flex-col gap-4">
        {sentNotice && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            Email sent successfully.
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#111111] p-1">
            <button
              onClick={() => handleViewChange("inbox")}
              className={`rounded-md px-4 py-1.5 text-sm transition ${
                view === "inbox"
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Inbox
            </button>

            <button
              onClick={() => handleViewChange("sent")}
              className={`rounded-md px-4 py-1.5 text-sm transition ${
                view === "sent"
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Sent
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing || listState === "loading"}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:bg-white/5 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button
              onClick={openCompose}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              <PenSquare className="h-4 w-4" />
              Compose
            </button>
          </div>
        </div>

        {view === "inbox" && (
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            searching={searching}
          />
        )}

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[360px_1fr]">
          {/* List panel — hidden on mobile when an email is open */}
          <div className={`min-h-0 overflow-y-auto rounded-xl border border-white/10 bg-[#111111] ${selected || detailLoading ? "hidden md:block" : "block"}`}>
            {listState === "loading" ? (
              <MailLoadingState />
            ) : listState === "not-connected" ? (
              <MailEmptyState
                title="No connected Gmail account"
                description="Connect Gmail to use the command center."
              >
                <button
                  onClick={() => router.push("/settings")}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                >
                  Go to Settings
                </button>
              </MailEmptyState>
            ) : listState === "error" ? (
              <MailErrorState
                title="Unable to load mail"
                description="Something went wrong while loading your messages."
                onRetry={() => loadList(view)}
              />
            ) : emails.length === 0 ? (
              <MailEmptyState
                title="No emails found"
                description={
                  view === "inbox"
                    ? "Your inbox is empty or no messages matched your search."
                    : "You have no sent emails yet."
                }
              />
            ) : (
              <InboxPanel
                emails={emails}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            )}
          </div>

          {/* Viewer panel — full screen on mobile when email is open, right pane on desktop */}
          <div className={`min-h-0 overflow-hidden rounded-xl border border-white/10 bg-[#111111] md:block ${selected || detailLoading ? "block" : "hidden"}`}>
            {/* Mobile back button */}
            {(selected || detailLoading) && (
              <div className="flex items-center border-b border-white/10 px-4 py-2 md:hidden">
                <button
                  onClick={() => { setSelected(null); setSelectedId(null); }}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              </div>
            )}
            {detailLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
              </div>
            ) : detailError ? (
              <MailErrorState
                title="Unable to open email"
                description={detailError}
              />
            ) : selected ? (
              <EmailViewer email={selected} onReply={handleReply} />
            ) : (
              <MailEmptyState
                title="Select an email"
                description="Choose a message from the list to read it here."
              />
            )}
          </div>
        </div>
      </div>

      {composeOpen && (
        <ComposeEmailModal
          key={`${composeTo}|${composeSubject}`}
          initialTo={composeTo}
          initialSubject={composeSubject}
          onClose={() => setComposeOpen(false)}
          onSent={() => {
            setSentNotice(true);
            if (view === "sent") {
              loadList("sent");
            }
          }}
        />
      )}
    </AppShell>
  );
}

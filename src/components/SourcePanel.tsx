import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  Download,
  FileText,
  BookMarked,
} from "lucide-react";
import SourceCard from "./SourceCard";
import FeedbackButtons from "./FeedbackButtons";
import Modal from "./Modal";
import { useLanguage } from "../i18n";
import { getSourceDetail } from "../api/sources";
import { buildDocumentDownloadUrl } from "../api/document";
import { ApiError } from "../api/client";
import type { ChatMessageType } from "../types";
import type { DocumentInfo, SourceDetail } from "../types/api";

interface SourcePanelProps {
  activeMessage: ChatMessageType | null;
  documentInfo: DocumentInfo | null;
  isDocumentLoading: boolean;
  documentError: string | null;
  onFeedback: (messageId: string, helpful: boolean) => Promise<boolean>;
}

interface SourceModalState {
  title: string;
  loading: boolean;
  error: string | null;
  detail: SourceDetail | null;
}

export default function SourcePanel({
  activeMessage,
  documentInfo,
  isDocumentLoading,
  documentError,
  onFeedback,
}: SourcePanelProps) {
  const { dictionary } = useLanguage();
  const { sourcePanel } = dictionary;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sourceModal, setSourceModal] = useState<SourceModalState | null>(null);

  const sources = activeMessage?.sources ?? [];
  const mainSource = sources[0] ?? null;
  const relatedSources = sources.slice(1);

  const openSourceDetail = async (parentId: string, fallbackTitle: string) => {
    setSourceModal({ title: fallbackTitle, loading: true, error: null, detail: null });
    try {
      const detail = await getSourceDetail(parentId);
      setSourceModal({ title: detail.heading, loading: false, error: null, detail });
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 404
          ? dictionary.errors.notFound
          : dictionary.errors.generic;
      setSourceModal({ title: fallbackTitle, loading: false, error: message, detail: null });
    }
  };

  const handleDownload = () => {
    if (!documentInfo) return;
    window.open(buildDocumentDownloadUrl(documentInfo.download_url), "_blank", "noopener,noreferrer");
  };

  const handleOpenAtPage = () => {
    if (!documentInfo || !mainSource) return;
    window.open(
      buildDocumentDownloadUrl(documentInfo.download_url, mainSource.page_start),
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <aside className="flex flex-col rounded-3xl border border-line bg-white/70 shadow-sm xl:h-full xl:min-h-0">
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        className="flex items-center justify-between gap-2 p-4 text-left md:cursor-default md:p-5"
      >
        <span className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" strokeWidth={2.2} />
          <h2 className="text-lg font-bold text-ink">{sourcePanel.heading}</h2>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-subink transition-transform md:hidden ${
            mobileOpen ? "rotate-180" : ""
          }`}
          strokeWidth={2.2}
        />
      </button>

      <div
        className={`${
          mobileOpen ? "flex" : "hidden"
        } scroll-thin min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 md:flex md:px-5 md:pb-5`}
      >
        <p className="-mt-2 wrap-text text-xs text-subink md:text-sm">{sourcePanel.intro}</p>

        {/* 出典文書 / 출처 문서 */}
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-subink">
            {sourcePanel.documentCardHeading}
          </h3>
          {isDocumentLoading ? (
            <div className="flex flex-col gap-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-line/50" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-line/50" />
            </div>
          ) : documentError ? (
            <p className="wrap-text text-xs text-red-500">{sourcePanel.documentLoadError}</p>
          ) : documentInfo ? (
            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.2} />
                <div className="min-w-0">
                  <p className="wrap-text text-sm font-bold text-ink">{documentInfo.filename}</p>
                  <p className="mt-0.5 text-xs text-subink">
                    {sourcePanel.updatedAtLabel}: {documentInfo.updated_at}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="mt-3 flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-primary-light hover:bg-primary-light hover:text-primary"
              >
                <Download className="h-3 w-3" strokeWidth={2.2} />
                {sourcePanel.downloadLabel}
              </button>
            </div>
          ) : null}
        </section>

        {/* 回答の根拠 / 답변 근거 */}
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-subink">
            {sourcePanel.answerBasisHeading}
          </h3>
          {!activeMessage ? (
            <div className="rounded-2xl border border-dashed border-line bg-white/60 p-4 text-xs leading-relaxed text-subink wrap-text md:text-sm">
              {sourcePanel.answerBasisEmpty}
            </div>
          ) : !mainSource ? (
            <div className="rounded-2xl border border-dashed border-line bg-white/60 p-4 text-xs leading-relaxed text-subink wrap-text md:text-sm">
              {sourcePanel.noSourcesText}
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="wrap-text text-sm font-bold text-ink">{mainSource.heading}</p>
              <p className="mt-2 wrap-text text-sm leading-relaxed text-ink">
                {mainSource.text_snippet}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-medium text-primary">
                  {sourcePanel.pageLabel} {mainSource.page_start}
                  {mainSource.page_end !== mainSource.page_start
                    ? `-${mainSource.page_end}`
                    : ""}
                </span>
                <button
                  type="button"
                  onClick={() => openSourceDetail(mainSource.parent_id, mainSource.heading)}
                  className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-primary-light hover:bg-primary-light hover:text-primary"
                >
                  <ExternalLink className="h-3 w-3" strokeWidth={2.2} />
                  {sourcePanel.viewOriginalLabel}
                </button>
                {documentInfo && (
                  <button
                    type="button"
                    onClick={handleOpenAtPage}
                    className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-primary-light hover:bg-primary-light hover:text-primary"
                  >
                    <BookMarked className="h-3 w-3" strokeWidth={2.2} />
                    {sourcePanel.openAtPageLabel}
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 関連条項 / 관련 조항 */}
        {relatedSources.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-subink">
              {sourcePanel.relatedArticlesHeading}
            </h3>
            <div className="flex flex-col gap-2">
              {relatedSources.map((source, index) => (
                <SourceCard
                  key={`${source.parent_id}-${index}`}
                  source={source}
                  onViewOriginal={() => openSourceDetail(source.parent_id, source.heading)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 回答の評価 / 답변 평가 */}
        {activeMessage && (
          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-subink">
              {sourcePanel.feedbackHeading}
            </h3>
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="wrap-text text-xs text-ink md:text-sm">
                {sourcePanel.feedbackQuestion}
              </p>
              <div className="mt-2.5">
                <FeedbackButtons
                  feedback={activeMessage.feedback}
                  onSubmit={(helpful) => onFeedback(activeMessage.id, helpful)}
                  size="md"
                />
              </div>
            </div>
          </section>
        )}
      </div>

      {sourceModal && (
        <Modal title={sourceModal.title} onClose={() => setSourceModal(null)}>
          {sourceModal.loading
            ? "..."
            : sourceModal.error
              ? sourceModal.error
              : sourceModal.detail?.text}
        </Modal>
      )}
    </aside>
  );
}

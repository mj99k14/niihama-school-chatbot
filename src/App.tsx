import { useEffect, useState } from "react";
import Header from "./components/Header";
import CategorySidebar from "./components/CategorySidebar";
import ChatPanel from "./components/ChatPanel";
import SourcePanel from "./components/SourcePanel";
import FooterNotice from "./components/FooterNotice";
import { useLanguage } from "./i18n";
import { useChat } from "./hooks/useChat";
import { useHealth } from "./hooks/useHealth";
import { useCategories } from "./hooks/useCategories";
import { useDocumentInfo } from "./hooks/useDocumentInfo";
import { useSuggestedQuestions } from "./hooks/useSuggestedQuestions";

export default function App() {
  const { lang, dictionary } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const healthStatus = useHealth();
  const { categories, isLoading: isCategoriesLoading, error: categoriesError } = useCategories();
  const {
    documentInfo,
    isLoading: isDocumentLoading,
    error: documentError,
  } = useDocumentInfo();
  const suggestedQuestions = useSuggestedQuestions(selectedCategoryId, lang);

  const {
    messages,
    isSending,
    sendMessage,
    retryMessage,
    submitFeedback,
    resetChat,
    clearChat,
    activeMessage,
    selectMessage,
  } = useChat(dictionary, lang, selectedCategoryId);

  useEffect(() => {
    document.title = dictionary.pageTitle;
    document.documentElement.lang = lang;
  }, [dictionary, lang]);

  return (
    <div className="flex min-h-dvh flex-col bg-bg xl:h-dvh xl:overflow-hidden">
      <Header healthStatus={healthStatus} onNewChat={resetChat} />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-4 md:gap-5 md:px-6 md:py-5 xl:min-h-0 xl:gap-6 xl:overflow-hidden xl:px-8 xl:py-6">
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:min-h-0 xl:grid-cols-[minmax(260px,0.9fr)_minmax(560px,2.1fr)_minmax(280px,0.95fr)] xl:gap-6 xl:overflow-hidden">
          <div className="order-2 md:order-1 xl:min-h-0">
            <CategorySidebar
              categories={categories}
              isLoading={isCategoriesLoading}
              error={categoriesError}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
          </div>

          <div className="order-3 md:order-2 xl:min-h-0">
            <ChatPanel
              messages={messages}
              isSending={isSending}
              activeMessageId={activeMessage?.id ?? null}
              healthStatus={healthStatus}
              suggestedQuestions={suggestedQuestions}
              onSend={sendMessage}
              onClear={clearChat}
              onSelectMessage={selectMessage}
              onRetry={retryMessage}
              onFeedback={submitFeedback}
            />
          </div>

          <div className="order-4 md:order-3 md:col-span-2 xl:col-span-1 xl:min-h-0">
            <SourcePanel
              activeMessage={activeMessage}
              documentInfo={documentInfo}
              isDocumentLoading={isDocumentLoading}
              documentError={documentError}
              onFeedback={submitFeedback}
            />
          </div>
        </div>

        <FooterNotice />
      </div>
    </div>
  );
}

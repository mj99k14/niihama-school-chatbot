export type Lang = "ja" | "ko";

export interface Dictionary {
  pageTitle: string;
  header: {
    schoolName: string;
    serviceName: string;
    newChatLabel: string;
    clearLabel: string;
    languageAria: string;
    onlineLabel: string;
    offlineLabel: string;
    checkingLabel: string;
  };
  avatar: {
    heroAlt: string;
    userAlt: string;
  };
  categorySection: {
    heading: string;
    allLabel: string;
    allDescription: string;
    loadError: string;
  };
  chat: {
    headerName: string;
    greeting: string;
    placeholder: string;
    inputAria: string;
    sendAria: string;
    thinkingLabel: string;
    helpfulLabel: string;
    notHelpfulLabel: string;
    feedbackThanks: string;
    feedbackError: string;
    regulationHeading: string;
    retryLabel: string;
    sendFailedLabel: string;
  };
  sourcePanel: {
    heading: string;
    intro: string;
    answerBasisHeading: string;
    answerBasisEmpty: string;
    noSourcesText: string;
    viewOriginalLabel: string;
    openAtPageLabel: string;
    pageLabel: string;
    relatedArticlesHeading: string;
    feedbackHeading: string;
    feedbackQuestion: string;
    documentCardHeading: string;
    updatedAtLabel: string;
    downloadLabel: string;
    documentLoadError: string;
  };
  footer: string[];
  modal: {
    closeAria: string;
  };
  errors: {
    validation: string;
    notFound: string;
    server: string;
    network: string;
    sourceNotFound: string;
    generic: string;
  };
}

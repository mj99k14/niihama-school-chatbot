interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export default function SuggestedQuestions({
  questions,
  onSelect,
  disabled,
}: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="flex shrink-0 flex-wrap gap-2 px-4 pb-3 md:px-6">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(question)}
          className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-primary wrap-text transition-all hover:-translate-y-0.5 hover:border-primary-light hover:bg-primary-light hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          {question}
        </button>
      ))}
    </div>
  );
}

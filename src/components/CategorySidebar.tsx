import { List } from "lucide-react";
import { categoryIcons, categoryFallbackIcon, allCategoriesIcon } from "../data/icons";
import { useLanguage, translateCategory } from "../i18n";
import type { CategoryResponse } from "../types/api";

interface CategorySidebarProps {
  categories: CategoryResponse[];
  isLoading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function CategorySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-2xl border border-line bg-line/40 md:h-[72px]"
        />
      ))}
    </div>
  );
}

export default function CategorySidebar({
  categories,
  isLoading,
  error,
  selectedId,
  onSelect,
}: CategorySidebarProps) {
  const { dictionary, lang } = useLanguage();
  const AllIcon = allCategoriesIcon;

  return (
    <aside className="flex max-h-[70vh] flex-col rounded-3xl border border-line bg-white/70 p-4 shadow-sm md:p-5 xl:h-full xl:max-h-none xl:min-h-0">
      <div className="mb-4 flex shrink-0 items-center gap-2 px-1">
        <List className="h-5 w-5 text-primary" strokeWidth={2.2} />
        <h2 className="text-lg font-bold text-ink">{dictionary.categorySection.heading}</h2>
      </div>

      {error ? (
        <p className="wrap-text px-1 text-sm text-red-500">
          {dictionary.categorySection.loadError}
        </p>
      ) : isLoading ? (
        <CategorySkeleton />
      ) : (
        <div className="scroll-thin flex min-h-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden pb-1 md:flex-col md:overflow-x-visible md:overflow-y-auto md:pb-0">
          <div className="w-56 shrink-0 md:w-auto">
            <button
              type="button"
              onClick={() => onSelect(null)}
              aria-pressed={selectedId === null}
              className={`group flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary md:p-4 ${
                selectedId === null
                  ? "border-transparent bg-gradient-to-br from-[#9B6AD6] to-[#B889E6] text-white shadow-md"
                  : "border-line bg-white text-ink shadow-sm hover:-translate-y-0.5 hover:shadow-md"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  selectedId === null ? "bg-white/25 text-white" : "bg-primary-light text-primary"
                }`}
              >
                <AllIcon className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-sm font-bold leading-snug wrap-text md:text-base">
                  {dictionary.categorySection.allLabel}
                </span>
                <span
                  className={`text-xs leading-snug wrap-text ${
                    selectedId === null ? "text-white/85" : "text-subink"
                  }`}
                >
                  {dictionary.categorySection.allDescription}
                </span>
              </span>
            </button>
          </div>

          {categories.map((category, index) => {
            const Icon = categoryIcons[category.id] ?? categoryFallbackIcon;
            const selected = category.id === selectedId;
            const text = translateCategory(category.id, lang, {
              label: category.label,
              description: category.description,
            });

            return (
              <div key={category.id} className="w-56 shrink-0 md:w-auto">
                <button
                  type="button"
                  onClick={() => onSelect(category.id)}
                  aria-pressed={selected}
                  className={`group flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary md:p-4 ${
                    selected
                      ? "border-transparent bg-gradient-to-br from-[#9B6AD6] to-[#B889E6] text-white shadow-md"
                      : "border-line bg-white text-ink shadow-sm hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      selected ? "bg-white/25 text-white" : "bg-primary-light text-primary"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-sm font-bold leading-snug wrap-text md:text-base">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${selected ? "text-white" : "text-primary"}`}
                        strokeWidth={2.2}
                      />
                      <span>{text.label}</span>
                    </span>
                    <span
                      className={`text-xs leading-snug wrap-text ${
                        selected ? "text-white/85" : "text-subink"
                      }`}
                    >
                      {text.description}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}

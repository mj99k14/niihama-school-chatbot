import { useLanguage } from "../i18n";

export default function FooterNotice() {
  const { dictionary } = useLanguage();

  return (
    <p className="mx-auto max-w-2xl shrink-0 px-4 py-1 text-center text-[11px] leading-snug text-subink wrap-text md:text-xs">
      {dictionary.footer.map((line, i) => (
        <span key={i}>
          {line}
          {i < dictionary.footer.length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}

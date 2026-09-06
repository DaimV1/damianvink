import { Check, Flag, Send, X } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { submitToolkitFeedback } from "@/lib/toolkit/feedback";
import type { ToolId } from "@/lib/toolkit/tools";
import { tx, useLocale } from "@/lib/i18n/locale";

type Status = "closed" | "open" | "sending" | "sent" | "error";

/**
 * "Klopt dit niet?" — one feedback link per tool page, feeding
 * migrations/0002_toolkit_feedback.sql via submitToolkitFeedback. Anonymous,
 * no required message (an empty report still tells us which page and which
 * URL/query state someone flagged — CopyLink already puts the calculator's
 * inputs in the URL, so that alone can be enough to reproduce the complaint).
 */
export function FeedbackWidget({ toolId }: { toolId: ToolId }) {
  const { locale } = useLocale();
  const [status, setStatus] = useState<Status>("closed");
  const [message, setMessage] = useState("");
  const textareaId = useId();

  if (status === "closed") {
    return (
      <div className="mt-8 print:hidden">
        <button
          type="button"
          onClick={() => setStatus("open")}
          className="inline-flex items-center gap-1.5 text-sm text-subtle underline decoration-line-strong decoration-dotted underline-offset-4 transition-colors hover:text-muted"
        >
          <Flag className="size-3.5" aria-hidden="true" />
          {tx(locale, "Klopt dit niet?", "Something wrong here?")}
        </button>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <p className="mt-8 flex items-center gap-1.5 text-sm text-muted print:hidden">
        <Check className="size-4 text-accent" aria-hidden="true" />
        {tx(locale, "Bedankt, dit wordt bekeken.", "Thanks, this will be looked at.")}
      </p>
    );
  }

  const sending = status === "sending";

  async function send() {
    setStatus("sending");
    try {
      await submitToolkitFeedback({
        data: {
          toolId,
          path: window.location.pathname,
          url: window.location.href,
          message,
          locale,
        },
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mt-8 max-w-md rounded-lg border border-line-strong bg-elevated p-4 print:hidden">
      <label htmlFor={textareaId} className="text-sm font-medium text-ink">
        {tx(locale, "Wat klopt er niet?", "What's wrong?")}
      </label>
      <p className="mt-1 text-xs text-subtle">
        {tx(
          locale,
          "Optioneel — de huidige pagina-URL (met je invoer) wordt meegestuurd.",
          "Optional — the current page URL (with your inputs) is sent along.",
        )}
      </p>
      <textarea
        id={textareaId}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        maxLength={2000}
        disabled={sending}
        className="mt-3 w-full resize-none rounded-md border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-50"
      />
      {status === "error" ? (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          {tx(
            locale,
            "Verzenden mislukt. Probeer het later opnieuw.",
            "Sending failed. Please try again later.",
          )}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={sending} onClick={send}>
          <Send className="size-4" aria-hidden="true" />
          {tx(locale, "Versturen", "Send")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={sending}
          onClick={() => setStatus("closed")}
        >
          <X className="size-4" aria-hidden="true" />
          {tx(locale, "Annuleren", "Cancel")}
        </Button>
      </div>
    </div>
  );
}

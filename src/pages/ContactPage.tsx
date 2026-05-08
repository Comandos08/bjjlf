import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

type Status = "idle" | "sending" | "success" | "error";

export function ContactPage() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);
    try {
      const { error } = await supabase.functions.invoke("send-contact-message", {
        body: { name, email, subject, message },
      });
      if (error) throw error;
      setStatus("success");
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch (err) {
      console.error("[contact] send failed", err);
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : t("contact.error"));
    }
  };

  const labelClass = "block text-xs uppercase tracking-widest text-gray-700 mb-2";
  const inputClass =
    "w-full bg-white border border-gray-200 focus:border-[#B8960C] outline-none text-gray-900 placeholder:text-gray-400 px-4 py-3 text-sm transition-colors";

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 lg:px-6 pt-16 lg:pt-24 pb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#B8960C] mb-3">
            BJJLF
          </p>
          <h1
            className="text-4xl lg:text-5xl uppercase tracking-wide mb-4 text-gray-900"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
          >
            {t("contact.title")}
          </h1>
          <p
            className="text-gray-600 text-base leading-relaxed max-w-xl"
            style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
          >
            {t("contact.intro")}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-12 lg:py-16">
        {status === "success" ? (
          <div
            className="border border-[#B8960C] bg-[#B8960C]/5 px-6 py-8 text-center"
            style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
          >
            <p className="text-[#B8960C] uppercase tracking-widest text-xs mb-3">
              ✓
            </p>
            <p className="text-gray-900 text-base">{t("contact.success")}</p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-6 inline-block border border-[#B8960C] text-[#B8960C] px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-[#B8960C] hover:text-white transition-colors"
            >
              {t("contact.sendAnother")}
            </button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-6"
            style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
          >
            <div>
              <label className={labelClass}>{t("contact.field.name")}</label>
              <input
                required
                maxLength={200}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("contact.field.email")}</label>
              <input
                required
                type="email"
                maxLength={320}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("contact.field.subject")}</label>
              <input
                required
                maxLength={300}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("contact.field.message")}</label>
              <textarea
                required
                maxLength={5000}
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${inputClass} resize-y`}
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-[#C41E3A]">
                {t("contact.error")}
                {errorMsg ? ` — ${errorMsg}` : ""}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full sm:w-auto bg-[#C41E3A] text-white px-8 py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-[#a51830] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {status === "sending" ? t("contact.sending") : t("contact.submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ContactPage;

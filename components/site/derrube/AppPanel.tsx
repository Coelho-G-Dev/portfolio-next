"use client";

import { AlertTriangle, Check, Loader } from "lucide-react";
import { useId } from "react";
import type { AppStatus } from "@/lib/derrubeApp";
import type { SiteCopy } from "@/lib/i18n/site";

// Tela de cadastro do AuthGuard (spec §5.4). Os dados são fictícios e vêm
// preenchidos: a pessoa não digita nada e nada é enviado a lugar nenhum.
export default function AppPanel({
  copy,
  status,
  onCreate,
}: {
  copy: SiteCopy["derrube"]["app"] & { send: string };
  status: AppStatus;
  onCreate: () => void;
}) {
  const nameId = useId();
  const emailId = useId();

  return (
    <div className="s-app" data-reveal>
      <p className="s-app__brand">{copy.title}</p>
      <h3 className="s-app__heading">{copy.heading}</h3>
      <label className="s-app__label" htmlFor={nameId}>
        {copy.nameLabel}
      </label>
      <input className="s-app__input" id={nameId} value={copy.person.name} readOnly />
      <label className="s-app__label" htmlFor={emailId}>
        {copy.emailLabel}
      </label>
      <input className="s-app__input" id={emailId} value={copy.person.email} readOnly />
      <button type="button" className="s-app__submit" onClick={onCreate}>
        {copy.send}
      </button>
      <p className="s-app__status" data-status={status}>
        {status === "error" && <AlertTriangle size={16} aria-hidden="true" />}
        {status === "delivered" && <Check size={16} aria-hidden="true" />}
        {(status === "processing" || status === "connecting") && <Loader size={16} aria-hidden="true" />}
        <span>{copy.status[status]}</span>
      </p>
      <p className="s-app__fake">{copy.fake}</p>
    </div>
  );
}

import type { RedesignCopy } from "@/lib/i18n/redesign";

export default function Services({ c }: { c: RedesignCopy }) {
  const s = c.services;
  return (
    <section id="servicos" className="rd-section rd-services" data-layer="queue" aria-labelledby="servicos-title">
      <h2 id="servicos-title" className="rd-head" data-rise>
        {s.title}
      </h2>
      <table className="rd-table" data-rise style={{ ["--i" as string]: 1 }}>
        <thead>
          <tr>
            <th scope="col">{s.head.problem}</th>
            <th scope="col">{s.head.delivery}</th>
            <th scope="col">{s.head.stack}</th>
            <th scope="col">{s.head.proof}</th>
          </tr>
        </thead>
        <tbody>
          {s.rows.map((r) => (
            <tr key={r.problem}>
              <td>{r.problem}</td>
              <td>{r.delivery}</td>
              <td>{r.stack}</td>
              <td>
                <a className="rd-link" href="#projetos">
                  {r.proof}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="rd-services__roles" data-rise>
        {s.roles}
      </p>
    </section>
  );
}

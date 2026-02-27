import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#dc2626",
  HIGH: "#ea580c",
  MEDIUM: "#d97706",
  LOW: "#16a34a",
};

function severityLabel(s: string): string {
  const m: Record<string, string> = { CRITICAL: "Kritik", HIGH: "Yüksek", MEDIUM: "Orta", LOW: "Düşük" };
  return m[s] ?? s;
}

function statusLabel(s: string): string {
  const m: Record<string, string> = {
    draft: "Taslak", in_review: "İncelemede",
    cae_review: "CAE Onayı", published: "Yayında", archived: "Arşiv",
  };
  return m[s] ?? s;
}

function renderBlock(block: any): string {
  switch (block.type) {
    case "heading": {
      const t = (block.content?.html ?? "").replace(/<[^>]+>/g, "");
      const level = block.content?.level ?? 2;
      return `<h${level} style="font-family:Georgia,serif;color:#1e293b;margin:1.5rem 0 0.75rem;">${t}</h${level}>`;
    }
    case "paragraph":
      return `<div style="font-family:Georgia,serif;color:#334155;line-height:1.8;margin-bottom:1rem;">${block.content?.html ?? ""}</div>`;
    case "ai_summary":
      return `<div style="border-left:4px solid #3b82f6;background:#eff6ff;padding:1rem;margin:1rem 0;border-radius:0 0.5rem 0.5rem 0;">
        <div style="font-size:0.7rem;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.5rem;">AI ÖZETİ</div>
        <div style="font-family:sans-serif;font-size:0.875rem;color:#1e3a5f;line-height:1.7;">${block.content?.html ?? ""}</div>
      </div>`;
    case "finding_ref":
      return `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:0.5rem;padding:0.75rem;margin:0.75rem 0;font-family:sans-serif;font-size:0.8rem;color:#7f1d1d;">
        Bulgu Referansı: ${block.content?.findingId ?? "—"}
      </div>`;
    default:
      return "";
  }
}

function buildHtml(report: any, sections: any[]): string {
  const now = new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });
  const es = report.executive_summary ?? {};
  const score = es.score ?? 0;
  const grade = es.grade ?? "—";

  const sectionsHtml = sections
    .sort((a: any, b: any) => a.order_index - b.order_index)
    .map((sec: any) => {
      const blocksHtml = (sec.blocks ?? [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map(renderBlock)
        .join("");
      return `
        <section style="margin-bottom:3rem;page-break-inside:avoid;">
          <h2 style="font-family:Georgia,serif;font-size:1.5rem;font-weight:700;color:#0f172a;padding-bottom:0.5rem;border-bottom:2px solid #e2e8f0;margin-bottom:1.5rem;">${sec.title}</h2>
          ${blocksHtml}
        </section>`;
    })
    .join("");

  const hashSeal = report.hash_seal
    ? `<div style="margin-top:2rem;padding:0.75rem 1rem;background:#f0fdf4;border:1px solid #86efac;border-radius:0.5rem;font-family:monospace;font-size:0.7rem;color:#166534;">
        SHA-256: ${report.hash_seal}
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${report.title} — Sentinel GRC</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; background: #fff; color: #1e293b; }
    @page { size: A4; margin: 2cm 2.5cm; }
    @media print {
      .no-print { display: none !important; }
      body { background: white; }
    }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto; padding: 2rem;">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2rem;padding-bottom:1rem;border-bottom:3px solid #0f172a;">
      <div>
        <div style="font-family:sans-serif;font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;margin-bottom:0.25rem;">SENTINEL GRC v3.0 — DENETİM RAPORU</div>
        <h1 style="font-size:1.75rem;font-weight:700;color:#0f172a;line-height:1.2;">${report.title}</h1>
        <div style="margin-top:0.5rem;font-family:sans-serif;font-size:0.75rem;color:#64748b;">
          Durum: <strong>${statusLabel(report.status)}</strong> &nbsp;|&nbsp; Tarih: ${now}
          ${report.auditor_name ? ` &nbsp;|&nbsp; Denetçi: <strong>${report.auditor_name}</strong>` : ""}
        </div>
      </div>
      <div style="text-align:center;background:#f8fafc;border:2px solid #e2e8f0;border-radius:1rem;padding:0.75rem 1.25rem;">
        <div style="font-family:sans-serif;font-size:2rem;font-weight:900;color:${score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"};">${grade}</div>
        <div style="font-family:sans-serif;font-size:0.65rem;color:#94a3b8;font-weight:600;">${score.toFixed(0)} / 100</div>
      </div>
    </div>

    <!-- Executive Summary Box -->
    ${es.auditOpinion || es.sections?.auditOpinion ? `
    <div style="background:#f8fafc;border-left:4px solid #0f172a;padding:1rem 1.25rem;border-radius:0 0.5rem 0.5rem 0;margin-bottom:2rem;">
      <div style="font-family:sans-serif;font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:0.5rem;">YÖNETİCİ ÖZETİ</div>
      <p style="font-family:Georgia,serif;font-size:0.875rem;color:#334155;line-height:1.7;">${es.sections?.auditOpinion ?? es.briefingNote ?? ""}</p>
    </div>` : ""}

    <!-- Finding Counts -->
    ${es.findingCounts ? `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.75rem;margin-bottom:2rem;">
      ${(["CRITICAL","HIGH","MEDIUM","LOW"] as const).map(sev => `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:0.5rem;padding:0.75rem;text-align:center;">
        <div style="font-size:1.5rem;font-weight:900;color:${SEVERITY_COLORS[sev]};">${(es.findingCounts as any)[sev.toLowerCase()] ?? 0}</div>
        <div style="font-family:sans-serif;font-size:0.65rem;font-weight:700;color:${SEVERITY_COLORS[sev]};text-transform:uppercase;">${severityLabel(sev)}</div>
      </div>`).join("")}
    </div>` : ""}

    <!-- Sections & Blocks -->
    ${sectionsHtml}

    ${hashSeal}

    <!-- Footer -->
    <div style="margin-top:3rem;padding-top:1rem;border-top:1px solid #e2e8f0;font-family:sans-serif;font-size:0.65rem;color:#94a3b8;text-align:center;">
      Bu rapor Sentinel GRC v3.0 platformu tarafından otomatik olarak oluşturulmuştur. ${now}
    </div>
  </div>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let reportId: string | null = null;

    if (req.method === "GET") {
      reportId = new URL(req.url).searchParams.get("reportId");
    } else {
      const body = await req.json().catch(() => ({}));
      reportId = body.reportId ?? null;
    }

    if (!reportId) {
      return new Response(JSON.stringify({ error: "reportId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: report, error: reportErr } = await supabase
      .from("m6_reports")
      .select("*")
      .eq("id", reportId)
      .maybeSingle();

    if (reportErr || !report) {
      return new Response(JSON.stringify({ error: reportErr?.message ?? "Report not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sectionsRaw, error: secErr } = await supabase
      .from("m6_report_sections")
      .select("*, m6_report_blocks(*)")
      .eq("report_id", reportId)
      .order("order_index");

    if (secErr) {
      return new Response(JSON.stringify({ error: secErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sections = (sectionsRaw ?? []).map((sec: any) => ({
      ...sec,
      blocks: (sec.m6_report_blocks ?? []).map((b: any) => ({
        id: b.id,
        type: b.block_type,
        orderIndex: b.order_index,
        content: b.content ?? {},
        snapshotData: b.snapshot_content,
      })),
    }));

    const html = buildHtml(report, sections);

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "X-Report-Id": reportId,
        "X-Generated-At": new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

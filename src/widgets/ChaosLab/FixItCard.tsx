import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench, ShieldCheck, Loader2, Lock, Check, Copy,
  AlertTriangle, FileCode, ChevronDown, ChevronUp,
} from 'lucide-react';
import clsx from 'clsx';

type FixPhase = 'preview' | 'approving' | 'jit' | 'applying' | 'success' | 'error';

interface FixScenario {
  id: string;
  title: string;
  resource: string;
  resourceType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  language: string;
  beforeCode: string;
  fixCode: string;
}

const SCENARIOS: FixScenario[] = [
  {
    id: 'fix-s3-public',
    title: 'S3 Bucket Acik Erisim',
    resource: 'aws_s3_bucket.audit_reports',
    resourceType: 'S3_BUCKET',
    severity: 'CRITICAL',
    description: 'Denetim raporlari iceren S3 bucket halka acik erisimde. Acil olarak "private" ACL ile kapatilmali.',
    language: 'terraform',
    beforeCode: `resource "aws_s3_bucket" "audit_reports" {
  bucket = "sentinel-audit-reports-prod"
  acl    = "public-read"   # !! GUVENLIK ACIĞI !!

  tags = {
    Environment = "production"
    Team        = "internal-audit"
  }
}`,
    fixCode: `resource "aws_s3_bucket" "audit_reports" {
  bucket = "sentinel-audit-reports-prod"
  acl    = "private"        # DUZELTILDI

  tags = {
    Environment = "production"
    Team        = "internal-audit"
  }
}

resource "aws_s3_bucket_public_access_block" "audit_reports" {
  bucket = aws_s3_bucket.audit_reports.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`,
  },
  {
    id: 'fix-iam-wildcard',
    title: 'IAM Politika Wildcard Erisim',
    resource: 'aws_iam_policy.db_access',
    resourceType: 'IAM_POLICY',
    severity: 'HIGH',
    description: 'IAM politikasi tum kaynaklara (*) tam yetki veriyor. En az yetki ilkesine gore sinirlandirilmali.',
    language: 'terraform',
    beforeCode: `resource "aws_iam_policy" "db_access" {
  name = "sentinel-db-full-access"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "*"           # !! ASIRI YETKI !!
      Resource = "*"
    }]
  })
}`,
    fixCode: `resource "aws_iam_policy" "db_access" {
  name = "sentinel-db-read-access"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = [              # DUZELTILDI
        "rds:DescribeDBInstances",
        "rds:DescribeDBClusters",
        "logs:GetLogEvents"
      ]
      Resource = "arn:aws:rds:eu-west-1:*:db/sentinel-*"
    }]
  })
}`,
  },
  {
    id: 'fix-fw-open',
    title: 'Firewall Kurali - Acik Port',
    resource: 'aws_security_group.app_sg',
    resourceType: 'FIREWALL_RULE',
    severity: 'CRITICAL',
    description: 'Guvenlik grubu 0.0.0.0/0 adresinden 22 (SSH) portuna erisime izin veriyor.',
    language: 'terraform',
    beforeCode: `resource "aws_security_group_rule" "ssh_access" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]  # !! HERKES ERISEBILIR !!
  security_group_id = aws_security_group.app_sg.id
}`,
    fixCode: `resource "aws_security_group_rule" "ssh_access" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["10.0.0.0/16"]  # DUZELTILDI: Sadece VPN
  security_group_id = aws_security_group.app_sg.id
}`,
  },
];

const EXECUTION_STEPS = [
  { step: 'JIT izin talep ediliyor...', delay: 800 },
  { step: 'JIT izin onaylandi (TTL: 300s)', delay: 600 },
  { step: 'terraform init...', delay: 700 },
  { step: 'terraform plan -out=fix.tfplan...', delay: 1000 },
  { step: 'Plan: 1 to change. 0 to add. 0 to destroy.', delay: 500 },
  { step: 'terraform apply fix.tfplan...', delay: 1200 },
  { step: 'Apply complete! Resources: 1 changed.', delay: 400 },
  { step: 'JIT izni geri aliniyor...', delay: 500 },
  { step: 'Dogrulama kontrolu calistiriliyor...', delay: 700 },
  { step: 'BASARILI: Kaynak artik uyumlu.', delay: 300 },
];

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 rounded-t-lg border-b border-slate-700">
        <span className="text-[10px] font-mono text-slate-500">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? 'Kopyalandi' : 'Kopyala'}
        </button>
      </div>
      <pre className="bg-slate-900 rounded-b-lg p-3 overflow-x-auto text-[11px] leading-relaxed font-mono text-slate-300">
        {code}
      </pre>
    </div>
  );
}

function FixScenarioCard({ scenario }: { scenario: FixScenario }) {
  const [phase, setPhase] = useState<FixPhase>('preview');
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const handleApprove = useCallback(async () => {
    setPhase('jit');
    setExecutionLog([]);

    for (const step of EXECUTION_STEPS) {
      await new Promise((r) => setTimeout(r, step.delay));
      setExecutionLog((prev) => [...prev, step.step]);

      if (step.step.includes('JIT izin onaylandi')) {
        setPhase('applying');
      }
    }

    setPhase('success');
  }, []);

  const severityColors = {
    CRITICAL: 'bg-red-100 text-red-700 border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  return (
    <div className={clsx(
      'bg-white border rounded-xl overflow-hidden transition-all',
      phase === 'success' ? 'border-emerald-200' : 'border-slate-200',
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
          phase === 'success' ? 'bg-emerald-100' : 'bg-red-100',
        )}>
          {phase === 'success' ? (
            <ShieldCheck size={16} className="text-emerald-600" />
          ) : (
            <AlertTriangle size={16} className="text-red-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{scenario.title}</span>
            <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded border', severityColors[scenario.severity])}>
              {scenario.severity}
            </span>
            {phase === 'success' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                DUZELTILDI
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-mono truncate block">{scenario.resource}</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-slate-600">{scenario.description}</p>

              {phase === 'preview' && (
                <>
                  <div>
                    <span className="text-[10px] font-bold text-red-600 mb-1.5 block flex items-center gap-1">
                      <AlertTriangle size={10} />
                      MEVCUT DURUM (Guvenlik Acigi)
                    </span>
                    <CodeBlock code={scenario.beforeCode} language={scenario.language} />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 mb-1.5 block flex items-center gap-1">
                      <FileCode size={10} />
                      ONERILEN DUZELTME
                    </span>
                    <CodeBlock code={scenario.fixCode} language={scenario.language} />
                  </div>

                  <button
                    onClick={handleApprove}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Lock size={14} />
                    Onayla & Calistir
                  </button>
                </>
              )}

              {(phase === 'jit' || phase === 'applying' || phase === 'success') && (
                <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-xs space-y-1.5">
                  {executionLog.map((line, i) => {
                    const isJit = line.includes('JIT');
                    const isSuccess = line.includes('BASARILI') || line.includes('complete');
                    const isPlan = line.includes('Plan:');

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-2"
                      >
                        <span className="text-slate-600 shrink-0">$</span>
                        <span className={clsx(
                          isSuccess ? 'text-emerald-400' :
                          isJit ? 'text-cyan-400' :
                          isPlan ? 'text-amber-400' :
                          'text-slate-400',
                        )}>
                          {line}
                        </span>
                      </motion.div>
                    );
                  })}

                  {phase !== 'success' && (
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Loader2 size={12} className="animate-spin" />
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        _
                      </motion.span>
                    </div>
                  )}
                </div>
              )}

              {phase === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
                >
                  <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-800 block">Duzeltme Basariyla Uygulandi</span>
                    <span className="text-[10px] text-emerald-600">JIT izni geri alindi. Kaynak artik uyumlu durumda.</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FixItCard() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Wrench size={16} className="text-slate-600" />
        <h3 className="text-sm font-bold text-slate-900">Aktif Iyilestirme (Fix-It)</h3>
        <span className="text-[10px] text-slate-500">IaC tabanli otomatik duzeltme</span>
      </div>

      {SCENARIOS.map((s) => (
        <FixScenarioCard key={s.id} scenario={s} />
      ))}
    </div>
  );
}

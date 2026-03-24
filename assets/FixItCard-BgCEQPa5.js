import{j as e,r as l,p as x,A as u,q as n,aq as j,P as k,m as d,g as I,L as v,a5 as N,b5 as C}from"./index-CySU8kiC.js";import{W as w}from"./wrench-D2VkSbar.js";import{C as E}from"./chevron-up-DMd98elH.js";import{F as T}from"./file-code-Bhb8q4hF.js";const A=[{id:"fix-s3-public",title:"S3 Bucket Acik Erisim",resource:"aws_s3_bucket.audit_reports",resourceType:"S3_BUCKET",severity:"CRITICAL",description:'Denetim raporlari iceren S3 bucket halka acik erisimde. Acil olarak "private" ACL ile kapatilmali.',language:"terraform",beforeCode:`resource "aws_s3_bucket" "audit_reports" {
 bucket = "sentinel-audit-reports-prod"
 acl = "public-read" # !! GUVENLIK ACIĞI !!

 tags = {
 Environment = "production"
 Team = "internal-audit"
 }
}`,fixCode:`resource "aws_s3_bucket" "audit_reports" {
 bucket = "sentinel-audit-reports-prod"
 acl = "private" # DUZELTILDI

 tags = {
 Environment = "production"
 Team = "internal-audit"
 }
}

resource "aws_s3_bucket_public_access_block" "audit_reports" {
 bucket = aws_s3_bucket.audit_reports.id

 block_public_acls = true
 block_public_policy = true
 ignore_public_acls = true
 restrict_public_buckets = true
}`},{id:"fix-iam-wildcard",title:"IAM Politika Wildcard Erisim",resource:"aws_iam_policy.db_access",resourceType:"IAM_POLICY",severity:"HIGH",description:"IAM politikasi tum kaynaklara (*) tam yetki veriyor. En az yetki ilkesine gore sinirlandirilmali.",language:"terraform",beforeCode:`resource "aws_iam_policy" "db_access" {
 name = "sentinel-db-full-access"
 policy = jsonencode({
 Version = "2012-10-17"
 Statement = [{
 Effect = "Allow"
 Action = "*" # !! ASIRI YETKI !!
 Resource = "*"
 }]
 })
}`,fixCode:`resource "aws_iam_policy" "db_access" {
 name = "sentinel-db-read-access"
 policy = jsonencode({
 Version = "2012-10-17"
 Statement = [{
 Effect = "Allow"
 Action = [ # DUZELTILDI
 "rds:DescribeDBInstances",
 "rds:DescribeDBClusters",
 "logs:GetLogEvents"
 ]
 Resource = "arn:aws:rds:eu-west-1:*:db/sentinel-*"
 }]
 })
}`},{id:"fix-fw-open",title:"Firewall Kurali - Acik Port",resource:"aws_security_group.app_sg",resourceType:"FIREWALL_RULE",severity:"CRITICAL",description:"Guvenlik grubu 0.0.0.0/0 adresinden 22 (SSH) portuna erisime izin veriyor.",language:"terraform",beforeCode:`resource "aws_security_group_rule" "ssh_access" {
 type = "ingress"
 from_port = 22
 to_port = 22
 protocol = "tcp"
 cidr_blocks = ["0.0.0.0/0"] # !! HERKES ERISEBILIR !!
 security_group_id = aws_security_group.app_sg.id
}`,fixCode:`resource "aws_security_group_rule" "ssh_access" {
 type = "ingress"
 from_port = 22
 to_port = 22
 protocol = "tcp"
 cidr_blocks = ["10.0.0.0/16"] # DUZELTILDI: Sadece VPN
 security_group_id = aws_security_group.app_sg.id
}`}],L=[{step:"JIT izin talep ediliyor...",delay:800},{step:"JIT izin onaylandi (TTL: 300s)",delay:600},{step:"terraform init...",delay:700},{step:"terraform plan -out=fix.tfplan...",delay:1e3},{step:"Plan: 1 to change. 0 to add. 0 to destroy.",delay:500},{step:"terraform apply fix.tfplan...",delay:1200},{step:"Apply complete! Resources: 1 changed.",delay:400},{step:"JIT izni geri aliniyor...",delay:500},{step:"Dogrulama kontrolu calistiriliyor...",delay:700},{step:"BASARILI: Kaynak artik uyumlu.",delay:300}];function m({code:s,language:t}){const[r,o]=l.useState(!1),c=()=>{navigator.clipboard.writeText(s),o(!0),setTimeout(()=>o(!1),2e3)};return e.jsxs("div",{className:"relative group",children:[e.jsxs("div",{className:"flex items-center justify-between px-3 py-1.5 bg-slate-800 rounded-t-lg border-b border-slate-700",children:[e.jsx("span",{className:"text-[10px] font-mono text-slate-500",children:t}),e.jsxs("button",{onClick:c,className:"flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors",children:[r?e.jsx(N,{size:10}):e.jsx(C,{size:10}),r?"Kopyalandi":"Kopyala"]})]}),e.jsx("pre",{className:"bg-slate-900 rounded-b-lg p-3 overflow-x-auto text-[11px] leading-relaxed font-mono text-slate-300",children:s})]})}function S({scenario:s}){const[t,r]=l.useState("preview"),[o,c]=l.useState([]),[p,b]=l.useState(!1),y=l.useCallback(async()=>{r("jit"),c([]);for(const a of L)await new Promise(i=>setTimeout(i,a.delay)),c(i=>[...i,a.step]),a.step.includes("JIT izin onaylandi")&&r("applying");r("success")},[]),g={CRITICAL:"bg-red-100 text-red-700 border-red-200",HIGH:"bg-orange-100 text-orange-700 border-orange-200",MEDIUM:"bg-amber-100 text-amber-700 border-amber-200"};return e.jsxs("div",{className:n("bg-surface border rounded-xl overflow-hidden transition-all",t==="success"?"border-emerald-200":"border-slate-200"),children:[e.jsxs("button",{onClick:()=>b(!p),className:"w-full flex items-center gap-3 p-4 text-left hover:bg-canvas/50 transition-colors",children:[e.jsx("div",{className:n("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",t==="success"?"bg-emerald-100":"bg-red-100"),children:t==="success"?e.jsx(x,{size:16,className:"text-emerald-600"}):e.jsx(u,{size:16,className:"text-red-600"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-sm font-bold text-primary",children:s.title}),e.jsx("span",{className:n("text-[9px] font-bold px-1.5 py-0.5 rounded border",g[s.severity]),children:s.severity}),t==="success"&&e.jsx("span",{className:"text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200",children:"DUZELTILDI"})]}),e.jsx("span",{className:"text-[10px] text-slate-500 font-mono truncate block",children:s.resource})]}),p?e.jsx(E,{size:16,className:"text-slate-400"}):e.jsx(j,{size:16,className:"text-slate-400"})]}),e.jsx(k,{children:p&&e.jsx(d.div,{initial:{height:0,opacity:0},animate:{height:"auto",opacity:1},exit:{height:0,opacity:0},className:"overflow-hidden",children:e.jsxs("div",{className:"px-4 pb-4 space-y-3",children:[e.jsx("p",{className:"text-xs text-slate-600",children:s.description}),t==="preview"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{children:[e.jsxs("span",{className:"text-[10px] font-bold text-red-600 mb-1.5 block flex items-center gap-1",children:[e.jsx(u,{size:10}),"MEVCUT DURUM (Guvenlik Acigi)"]}),e.jsx(m,{code:s.beforeCode,language:s.language})]}),e.jsxs("div",{children:[e.jsxs("span",{className:"text-[10px] font-bold text-emerald-600 mb-1.5 block flex items-center gap-1",children:[e.jsx(T,{size:10}),"ONERILEN DUZELTME"]}),e.jsx(m,{code:s.fixCode,language:s.language})]}),e.jsxs("button",{onClick:y,className:"w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors",children:[e.jsx(I,{size:14}),"Onayla & Calistir"]})]}),(t==="jit"||t==="applying"||t==="success")&&e.jsxs("div",{className:"bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-xs space-y-1.5",children:[(o||[]).map((a,i)=>{const f=a.includes("JIT"),h=a.includes("BASARILI")||a.includes("complete"),_=a.includes("Plan:");return e.jsxs(d.div,{initial:{opacity:0,x:-6},animate:{opacity:1,x:0},className:"flex items-start gap-2",children:[e.jsx("span",{className:"text-slate-600 shrink-0",children:"$"}),e.jsx("span",{className:n(h?"text-emerald-400":f?"text-cyan-400":_?"text-amber-400":"text-slate-400"),children:a})]},i)}),t!=="success"&&e.jsxs("div",{className:"flex items-center gap-2 text-cyan-400",children:[e.jsx(v,{size:12,className:"animate-spin"}),e.jsx(d.span,{animate:{opacity:[1,.3,1]},transition:{duration:.8,repeat:1/0},children:"_"})]})]}),t==="success"&&e.jsxs(d.div,{initial:{opacity:0,y:8},animate:{opacity:1,y:0},className:"flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg",children:[e.jsx(x,{size:20,className:"text-emerald-600 shrink-0"}),e.jsxs("div",{children:[e.jsx("span",{className:"text-xs font-bold text-emerald-800 block",children:"Duzeltme Basariyla Uygulandi"}),e.jsx("span",{className:"text-[10px] text-emerald-600",children:"JIT izni geri alindi. Kaynak artik uyumlu durumda."})]})]})]})})})]})}function P(){return e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[e.jsx(w,{size:16,className:"text-slate-600"}),e.jsx("h3",{className:"text-sm font-bold text-primary",children:"Aktif Iyilestirme (Fix-It)"}),e.jsx("span",{className:"text-[10px] text-slate-500",children:"IaC tabanli otomatik duzeltme"})]}),(A||[]).map(s=>e.jsx(S,{scenario:s},s.id))]})}export{P as FixItCard};

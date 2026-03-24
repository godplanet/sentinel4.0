import{ay as n,r as c,j as i,b as f,L as _,Z as g}from"./index-CySU8kiC.js";const w="00000000-0000-0000-0000-000000000001",m={async getAll(){const{data:e,error:t}=await n.from("actions").select(`
 *,
 evidence:action_evidence(*),
 requests:action_requests(*),
 logs:action_logs(*)
 `).order("created_at",{ascending:!1});if(t)throw t;return e||[]},async getById(e){const{data:t,error:a}=await n.from("actions").select(`
 *,
 evidence:action_evidence(*),
 requests:action_requests(*),
 logs:action_logs(*)
 `).eq("id",e).maybeSingle();if(a)throw a;return t},async getByFinding(e){const{data:t,error:a}=await n.from("actions").select(`
 *,
 evidence:action_evidence(*),
 requests:action_requests(*)
 `).eq("finding_id",e).order("created_at",{ascending:!1});if(a)throw a;return t||[]},async getByStatus(e){const{data:t,error:a}=await n.from("actions").select(`
 *,
 evidence:action_evidence(*),
 requests:action_requests(*)
 `).eq("status",e).order("current_due_date",{ascending:!0});if(a)throw a;return t||[]},async getMyActions(){var s;const{data:e}=await n.auth.getUser(),t=((s=e.user)==null?void 0:s.id)??w,{data:a,error:r}=await n.from("actions").select(`
 *,
 evidence:action_evidence(*),
 requests:action_requests(*)
 `).eq("assignee_user_id",t).order("current_due_date",{ascending:!0});if(r)throw r;return a||[]},async create(e){const{data:t,error:a}=await n.rpc("create_action_from_finding",{p_finding_id:e.finding_id,p_assignee_user_id:e.assignee_user_id,p_due_date:e.original_due_date,p_title:e.title,p_assignee_unit_name:e.assignee_unit_name});if(a)throw a;if(t){const r=await this.getById(t);if(!r)throw new Error("Failed to retrieve created action");return r}throw new Error("Failed to create action")},async update(e,t){const{data:a,error:r}=await n.from("actions").update({...t,updated_at:new Date().toISOString()}).eq("id",e).select().single();if(r)throw r;return a},async close(e){const{data:t,error:a}=await n.from("actions").update({status:"closed",closed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",e).select().single();if(a)throw a;return t},async reject(e,t){const{data:a,error:r}=await n.from("actions").update({status:"auditor_rejected",description:t,updated_at:new Date().toISOString()}).eq("id",e).select().single();if(r)throw r;return a},async autoFix(e){var a;const t=await this.getById(e);if(!t)throw new Error("Action not found");if(!((a=t.auto_fix_config)!=null&&a.enabled))throw new Error("Auto-fix not enabled for this action");return await p.create({action_id:e,file_name:"auto-fix-result.json",storage_path:"/system/auto-fix/"+e,file_hash:"AUTO_FIX_"+Date.now(),description:"Automatically fixed by system"}),await this.close(e)}},p={async getByAction(e){const{data:t,error:a}=await n.from("action_evidence").select("*").eq("action_id",e).order("created_at",{ascending:!1});if(a)throw a;return t||[]},async create(e){const{data:t,error:a}=await n.from("action_evidence").insert({...e,created_at:new Date().toISOString()}).select().single();if(a)throw a;return t},async delete(e){const{error:t}=await n.from("action_evidence").delete().eq("id",e);if(t)throw t}},y={async getByAction(e){const{data:t,error:a}=await n.from("action_logs").select("*").eq("action_id",e).order("created_at",{ascending:!1});if(a)throw a;return t||[]}};function h({action:e,onSuccess:t}){var o;const[a,r]=c.useState(!1),[s,d]=c.useState(!1);if(!((o=e.auto_fix_config)!=null&&o.enabled))return null;const l=async()=>{if(confirm("Execute auto-fix? This will automatically close the action if successful."))try{r(!0),await m.autoFix(e.id),d(!0),setTimeout(()=>{t==null||t()},1500)}catch(u){console.error("Auto-fix failed:",u),alert("Auto-fix failed. Please try manually."),r(!1)}};return s?i.jsxs("div",{className:"flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-300",children:[i.jsx(f,{size:18}),i.jsx("span",{className:"font-medium",children:"Auto-fixed successfully!"})]}):i.jsx("button",{onClick:l,disabled:a,className:`\r
 flex items-center gap-2 px-4 py-2.5\r
 bg-gradient-to-r from-purple-600 to-purple-700\r
 text-white rounded-lg\r
 hover:from-purple-700 hover:to-purple-800\r
 shadow-md hover:shadow-lg\r
 transition-all font-medium\r
 disabled:opacity-50 disabled:cursor-not-allowed\r
 group\r
 `,children:a?i.jsxs(i.Fragment,{children:[i.jsx(_,{size:18,className:"animate-spin"}),i.jsx("span",{children:"Executing Auto-Fix..."})]}):i.jsxs(i.Fragment,{children:[i.jsx(g,{size:18,className:"group-hover:animate-pulse"}),i.jsx("span",{children:"Auto-Fix"})]})})}const v=Object.freeze(Object.defineProperty({__proto__:null,AutoFixButton:h},Symbol.toStringTag,{value:"Module"}));export{h as A,m as a,v as b,y as l};

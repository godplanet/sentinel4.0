import{ay as s}from"./index-CySU8kiC.js";const i={async getAll(){const{data:e,error:t}=await s.from("audit_findings").select(`
 *,
 assignment:assignments(*)
 `).order("created_at",{ascending:!1});if(t)throw t;return e||[]},async getById(e){const{data:t,error:a}=await s.from("audit_findings").select(`
 *,
 assignment:assignments(*),
 action_steps:assignments(action_steps(*))
 `).eq("id",e).maybeSingle();if(a)throw a;return t},async getByAudit(e){const{data:t,error:a}=await s.from("audit_findings").select(`
 *,
 assignment:assignments(*)
 `).eq("audit_id",e).order("created_at",{ascending:!1});if(a)throw a;return t||[]},async create(e){const{data:t,error:a}=await s.from("audit_findings").insert(e).select().single();if(a)throw a;return t},async update(e,t){const{data:a,error:n}=await s.from("audit_findings").update(t).eq("id",e).select().single();if(n)throw n;return a},async delete(e){const{error:t}=await s.from("audit_findings").delete().eq("id",e);if(t)throw t}},o={async create(e){const{data:t,error:a}=await s.from("assignments").insert(e).select().single();if(a)throw a;return t},async update(e,t){const{data:a,error:n}=await s.from("assignments").update(t).eq("id",e).select().single();if(n)throw n;return a},async getMyAssignments(){const{data:e,error:t}=await s.from("assignments").select("*").order("created_at",{ascending:!1});if(t)throw t;return e||[]}},d={async create(e){const{data:t,error:a}=await s.from("action_steps").insert(e).select().single();if(a)throw a;return t},async update(e,t){const{data:a,error:n}=await s.from("action_steps").update(t).eq("id",e).select().single();if(n)throw n;return a},async getByAssignment(e){const{data:t,error:a}=await s.from("action_steps").select("*").eq("assignment_id",e).order("due_date",{ascending:!0});if(a)throw a;return t||[]}};export{o as a,d as b,i as f};

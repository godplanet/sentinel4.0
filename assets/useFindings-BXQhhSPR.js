import{u as t,ay as i}from"./index-CySU8kiC.js";function u(e){return t({queryKey:["finding",e],queryFn:async()=>{const{data:r,error:n}=await i.from("audit_findings").select(`
 *,
 action_plans (*)
 `).eq("id",e).maybeSingle();if(n)throw n;return r},enabled:!!e})}function o(e,r=!1){return t({queryKey:["finding-secret",e],queryFn:async()=>{const{data:n,error:a}=await i.from("finding_secrets").select("*").eq("finding_id",e).maybeSingle();if(a)throw a;return n},enabled:!!e&&r})}export{o as a,u};

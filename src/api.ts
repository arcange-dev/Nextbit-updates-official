const API=(import.meta.env.VITE_API_URL||"/api").replace(/\/$/,"");
async function request(path:string,init:RequestInit={}){const r=await fetch(`${API}${path}`,{headers:{"Content-Type":"application/json",...(init.headers||{})},...init});const body=await r.json().catch(()=>({}));if(!r.ok)throw new Error(body.error||"Request failed");return body.data??body}
const authHeaders=(token:string)=>({Authorization:`Bearer ${token}`});
export const api={
health:()=>request("/health"),
articles:(q="")=>request(`/articles${q?`?q=${encodeURIComponent(q)}`:""}`),
roadmaps:()=>request("/roadmaps"),
projects:()=>request("/projects"),
search:(q:string)=>request(`/search?q=${encodeURIComponent(q)}`),
register:(payload:{name:string;email:string;password:string})=>request("/auth/register",{method:"POST",body:JSON.stringify(payload)}),
login:(payload:{email:string;password:string})=>request("/auth/login",{method:"POST",body:JSON.stringify(payload)}),
me:(token:string)=>request("/auth/me",{headers:authHeaders(token)}),
subscribe:(email:string)=>request("/newsletter/subscribe",{method:"POST",body:JSON.stringify({email})}),
contact:(payload:{name:string;email:string;message:string})=>request("/contact",{method:"POST",body:JSON.stringify(payload)}),
bookmarks:(token:string)=>request("/bookmarks",{headers:authHeaders(token)}),
toggleBookmark:(token:string,id:string)=>request(`/bookmarks/${encodeURIComponent(id)}`,{method:"POST",headers:authHeaders(token)}),
adminOverview:(token:string)=>request("/admin/overview",{headers:authHeaders(token)}),
adminArticles:(token:string)=>request("/admin/articles",{headers:authHeaders(token)}),
adminUsers:(token:string)=>request("/admin/users",{headers:authHeaders(token)}),
updateUser:(token:string,id:string,payload:unknown)=>request(`/admin/users/${encodeURIComponent(id)}`,{method:"PATCH",headers:authHeaders(token),body:JSON.stringify(payload)}),
adminContacts:(token:string)=>request("/admin/contacts",{headers:authHeaders(token)}),
updateContact:(token:string,id:string,status:string)=>request(`/admin/contacts/${encodeURIComponent(id)}`,{method:"PATCH",headers:authHeaders(token),body:JSON.stringify({status})}),
adminSources:(token:string)=>request("/admin/sources",{headers:authHeaders(token)}),
createSource:(token:string,payload:unknown)=>request("/admin/sources",{method:"POST",headers:authHeaders(token),body:JSON.stringify(payload)}),
adminActivity:(token:string)=>request("/admin/activity",{headers:authHeaders(token)}),
createArticle:(token:string,payload:unknown)=>request("/admin/articles",{method:"POST",headers:authHeaders(token),body:JSON.stringify(payload)}),
updateArticle:(token:string,id:string,payload:unknown)=>request(`/admin/articles/${encodeURIComponent(id)}`,{method:"PUT",headers:authHeaders(token),body:JSON.stringify(payload)}),
deleteArticle:(token:string,id:string)=>request(`/admin/articles/${encodeURIComponent(id)}`,{method:"DELETE",headers:authHeaders(token)})
};

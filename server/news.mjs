import Parser from "rss-parser";

const parser=new Parser({timeout:12000,customFields:{item:[["media:content","media:content",{keepArray:false}],["media:thumbnail","media:thumbnail",{keepArray:false}]]}});
const GOOGLE=(q)=>`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
export const NEWS_FEEDS=[
  {id:"google-ai",name:"Google News",type:"google",topic:"AI",url:GOOGLE("AI technology OR artificial intelligence")},
  {id:"google-cyber",name:"Google News",type:"google",topic:"Cybersecurity",url:GOOGLE("cybersecurity OR cyber attack OR data breach")},
  {id:"google-software",name:"Google News",type:"google",topic:"Software",url:GOOGLE("software engineering OR developer OR cloud computing")},
  {id:"google-hardware",name:"Google News",type:"google",topic:"Hardware",url:GOOGLE("semiconductors OR chips OR GPU OR processor")},
  {id:"google-robotics",name:"Google News",type:"google",topic:"Robotics",url:GOOGLE("robotics OR humanoid robot")},
  {id:"google-africa",name:"Google News",type:"google",topic:"Africa Tech",url:GOOGLE("Africa technology OR African startups OR Rwanda technology")},
  {id:"google-space",name:"Google News",type:"google",topic:"Space Tech",url:GOOGLE("space technology OR satellite OR NASA")},
  {id:"techcrunch",name:"TechCrunch",type:"publisher",topic:"Startups",url:"https://techcrunch.com/feed/"},
  {id:"the-verge",name:"The Verge",type:"publisher",topic:"Technology",url:"https://www.theverge.com/rss/index.xml"},
  {id:"ars",name:"Ars Technica",type:"publisher",topic:"Technology",url:"https://feeds.arstechnica.com/arstechnica/index"},
  {id:"wired",name:"WIRED",type:"publisher",topic:"Technology",url:"https://www.wired.com/feed/rss"},
  {id:"nvidia",name:"NVIDIA",type:"official",topic:"AI & Hardware",url:"https://blogs.nvidia.com/feed/"}
];

const strip=(value="")=>String(value).replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g," ").trim();
const imageFrom=(item)=>item.enclosure?.url||item["media:content"]?.url||item["media:thumbnail"]?.url||(item.content?.match(/<img[^>]+src=["']([^"']+)/i)?.[1]||"");
const domain=(url="")=>{try{return new URL(url).hostname.replace(/^www\./,"")}catch{return ""}};
const classify=(title="",summary="")=>{const text=(title+" "+summary).toLowerCase();if(/cyber|hack|breach|malware|ransom|vulnerability|security/.test(text))return"Cybersecurity";if(/semiconductor|chip|gpu|cpu|processor|silicon|hardware/.test(text))return"Hardware";if(/robot|drone|autonom/.test(text))return"Robotics";if(/africa|rwanda|kenya|nigeria|ghana|uganda|ethiopia|tanzania/.test(text))return"Africa Tech";if(/space|satellite|rocket|nasa|moon|mars/.test(text))return"Space Tech";if(/cloud|developer|software|programming|browser|app|database|open source/.test(text))return"Software";if(/ai|artificial intelligence|machine learning|llm|model|agent|neural/.test(text))return"AI";return"Technology"};
const parseDate=(value)=>{const d=value?new Date(value):new Date();return Number.isNaN(d.getTime())?new Date():d};
const normalize=({item,feed})=>{const title=strip(item.title||"Untitled technology story");const summary=strip(item.contentSnippet||item.content||item.summary||"").slice(0,500);const url=item.link||item.guid||"";const publishedAt=parseDate(item.isoDate||item.pubDate);return{id:`${feed.id}:${Buffer.from(url||title).toString("base64url").slice(0,30)}`,title,summary,url,publishedAt:publishedAt.toISOString(),source:feed.name,sourceType:feed.type,feedId:feed.id,topic:classify(title,summary),feedTopic:feed.topic,image:imageFrom(item),domain:domain(url)}};
let cache={at:0,items:[],errors:[]};
export async function getTrending({topic="all",limit=60,refresh=false}={}){const now=Date.now();if(!refresh&&cache.items.length&&now-cache.at<5*60*1000){return{items:filter(cache.items,topic).slice(0,limit),updatedAt:new Date(cache.at).toISOString(),errors:cache.errors}}const results=await Promise.allSettled(NEWS_FEEDS.map(async feed=>{const parsed=await parser.parseURL(feed.url);return parsed.items.map(item=>normalize({item,feed}))}));const items=[];const errors=[];for(let i=0;i<results.length;i++){const r=results[i];if(r.status==="fulfilled")items.push(...r.value);else errors.push({feed:NEWS_FEEDS[i].name,topic:NEWS_FEEDS[i].topic,error:String(r.reason?.message||r.reason)})}const unique=new Map();for(const item of items){const key=(item.url||item.title).toLowerCase();if(!unique.has(key))unique.set(key,item)}const sorted=[...unique.values()].sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));cache={at:now,items:sorted,errors};return{items:filter(sorted,topic).slice(0,limit),updatedAt:new Date(now).toISOString(),errors}};
function filter(items,topic){if(!topic||topic==="all")return items;const needle=topic.toLowerCase();return items.filter(x=>x.topic.toLowerCase()===needle||x.feedTopic.toLowerCase()===needle)};

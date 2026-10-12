import React, { useEffect, useRef, useState } from "react";
import { Link2, MessageSquare, Reply, Send, Trash2 } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../lib/auth";

type Comment = {
  id: number; article_id: string; parent_id: number | null; body: string;
  author_name: string; user_id: number | string | null; created_at: string; has_replies?: boolean;
};

// Threaded comment engine under articles: text-only, one reply level,
// for logged-in users. Authors can delete their own comments; admins can
// delete anything. Data: GET/POST /api/articles/:id/comments.
export default function Comments({ articleId }: { articleId: string }) {
  const { token, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [fieldErr, setFieldErr] = useState("");
  const boxRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.comments(articleId)
      .then((d: any) => active && setComments(d || []))
      .catch(() => active && setErr("Comments are unavailable right now."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [articleId]);

  const roots = comments.filter((c) => !c.parent_id);
  const repliesOf = (id: number) => comments.filter((c) => c.parent_id === id);

  const post = async () => {
    const text = body.trim();
    if (text.length < 2) { setFieldErr("Write at least 2 characters."); return; }
    if (text.length > 2000) { setFieldErr("Keep it under 2000 characters."); return; }
    setBusy(true); setErr(""); setFieldErr("");
    try {
      const created: any = await api.postComment(articleId, text, replyTo || undefined, token!);
      setComments((cs) => [...cs, created]);
      setBody(""); setReplyTo(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not post the comment");
    } finally { setBusy(false); }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.deleteComment(id, token!);
      setComments((cs) => cs.filter((c) => c.id !== id && c.parent_id !== id));
    } catch (e) { setErr(e instanceof Error ? e.message : "Delete failed"); }
  };

  const CommentBody = ({ c, reply }: { c: Comment; reply?: boolean }) => (
    <li className={reply ? "border-l border-line pl-4" : ""}>
      <div className="glass-card p-5">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center bg-orange/15 font-mono text-[10px] text-orange">
            {c.author_name.slice(0, 2).toUpperCase()}
          </span>
          <b className="text-sm">{c.author_name}</b>
          {user && c.user_id === user.id && <span className="font-mono text-[9px] text-zinc-600">you</span>}
          <time className="ml-auto font-mono text-[9px] text-zinc-600">{new Date(c.created_at).toLocaleString()}</time>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{c.body}</p>
        <div className="mt-3 flex gap-4">
          {!reply && user && (
            <button onClick={() => { setReplyTo(c.id); boxRef.current?.focus(); }} className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-orange">
              <Reply size={12} aria-hidden /> Reply
            </button>
          )}
          {user && (c.user_id === user.id || user.role === "admin") && (
            <button onClick={() => remove(c.id)} className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-red-400">
              <Trash2 size={12} aria-hidden /> Delete
            </button>
          )}
        </div>
      </div>
    </li>
  );

  return (
    <section aria-label="Comments" className="mx-auto mt-16 max-w-5xl border-t border-line pt-14">
      <h2 className="flex items-center gap-2 font-display text-3xl font-bold">
        <MessageSquare size={20} className="text-orange" aria-hidden /> Discussion <span className="text-base text-zinc-600">({roots.length})</span>
      </h2>

      {user ? (
        <div className="mt-6">
          {replyTo && (
            <p className="mb-2 text-xs text-zinc-500">
              Replying to comment #{replyTo} · <button onClick={() => setReplyTo(null)} className="text-orange hover:underline">cancel</button>
            </p>
          )}
          <textarea
            ref={boxRef} rows={3} maxLength={2000} value={body}
            onChange={(e) => { setBody(e.target.value); setFieldErr(""); }}
            placeholder="Add to the discussion. Be technical, be kind."
            aria-label="Write a comment"
            className="w-full border border-line bg-black/30 p-4 text-sm outline-none focus:border-orange/50" />
          <div className="mt-2 flex items-center justify-between">
            <span className={fieldErr ? "text-xs text-red-400" : "text-xs text-zinc-600"}>{fieldErr || `${body.length}/2000`}</span>
            <button onClick={post} disabled={busy || !body.trim()} className="liquid-button disabled:opacity-50">
              <Send size={14} className="mr-1 inline" aria-hidden /> {busy ? "Posting…" : replyTo ? "Post reply" : "Post comment"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-6 flex items-center gap-2 border border-line bg-card p-4 text-sm text-zinc-500">
          <Link2 size={14} className="text-orange" aria-hidden />
          <span><button onClick={() => (location.hash = "#/login")} className="text-orange hover:underline">Sign in</button> to join the discussion.</span>
        </p>
      )}

      {err && <p role="alert" className="mt-4 text-sm text-red-400">{err}</p>}

      {loading ? (
        <div className="mt-8 grid gap-3">{Array.from({ length: 2 }, (_, i) => <div key={i} className="glass-card h-24 animate-pulse" />)}</div>
      ) : !roots.length ? (
        <p className="mt-8 text-sm text-zinc-600">No comments yet. Start the conversation.</p>
      ) : (
        <div className="mt-8 grid gap-4">
          {roots.map((c) => (
            <React.Fragment key={c.id}>
              <CommentBody c={c} />
              {repliesOf(c.id).length > 0 && (
                <ol className="grid gap-3 pl-4">{repliesOf(c.id).map((rc) => <CommentBody key={rc.id} c={rc} reply />)}</ol>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </section>
  );
}

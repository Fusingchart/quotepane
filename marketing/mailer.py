"""Send outreach from the QuotePane brand inbox and check replies.

  python3 marketing/mailer.py send marketing/outreach.json          # dry run: prints what would go out
  python3 marketing/mailer.py send marketing/outreach.json --live   # actually sends (max DAILY_CAP/day)
  python3 marketing/mailer.py replies                               # list replies, record opt-outs

Credentials come from ~/quotepane/.env (git-ignored):
  QP_EMAIL=quotepane.hq@gmail.com
  QP_APP_PASSWORD=xxxx xxxx xxxx xxxx
  QP_POSTAL=123 Main St, City, ST 00000
"""
import email
import imaplib
import json
import smtplib
import sys
from datetime import date, datetime
from email.message import EmailMessage
from email.utils import parseaddr
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOG = ROOT / "marketing" / "sent_log.json"      # git-ignored
OPTOUT = ROOT / "marketing" / "optouts.json"    # git-ignored
DAILY_CAP = 20


def env():
    vals = {}
    for line in (ROOT / ".env").read_text().splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            k, v = line.split("=", 1)
            vals[k.strip()] = v.strip()
    for k in ("QP_EMAIL", "QP_APP_PASSWORD", "QP_POSTAL"):
        if not vals.get(k):
            sys.exit(f"missing {k} in {ROOT / '.env'}")
    return vals


def load(path, default):
    return json.loads(path.read_text()) if path.exists() else default


def send(outreach_path, live):
    cfg = env()
    log = load(LOG, [])
    optouts = set(load(OPTOUT, []))
    already = {e["email"].lower() for e in log}
    today = sum(1 for e in log if e["date"] == date.today().isoformat())
    queue = [p for p in json.loads(Path(outreach_path).read_text())
             if p["email"].lower() not in already and p["email"].lower() not in optouts]
    room = max(0, DAILY_CAP - today)
    batch = queue[:room]
    print(f"{len(queue)} unsent, {today} sent today, sending {len(batch)}{'' if live else ' (dry run)'}")
    if not batch:
        return
    smtp = None
    if live:
        smtp = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        smtp.login(cfg["QP_EMAIL"], cfg["QP_APP_PASSWORD"])
    for p in batch:
        body = p["body"].replace("[postal address required by CAN-SPAM]", cfg["QP_POSTAL"])
        msg = EmailMessage()
        msg["From"] = f"QuotePane <{cfg['QP_EMAIL']}>"
        msg["To"] = p["email"]
        msg["Subject"] = p["subject"]
        msg.set_content(body)
        if live:
            smtp.send_message(msg)
            log.append({"email": p["email"], "name": p["name"], "date": date.today().isoformat(),
                        "at": datetime.now().isoformat(timespec="seconds")})
            LOG.write_text(json.dumps(log, indent=2))
            print("sent", p["email"])
        else:
            print(f"--- to {p['email']} | {p['subject']}\n{body}\n")
    if smtp:
        smtp.quit()


def replies():
    cfg = env()
    sent = {e["email"].lower(): e["name"] for e in load(LOG, [])}
    optouts = set(load(OPTOUT, []))
    imap = imaplib.IMAP4_SSL("imap.gmail.com")
    imap.login(cfg["QP_EMAIL"], cfg["QP_APP_PASSWORD"])
    imap.select("INBOX")
    _, ids = imap.search(None, "ALL")
    for i in ids[0].split()[-200:]:
        _, data = imap.fetch(i, "(RFC822)")
        m = email.message_from_bytes(data[0][1])
        sender = parseaddr(m["From"])[1].lower()
        if sender not in sent:
            continue
        part = m.get_body(preferencelist=("plain",)) if hasattr(m, "get_body") else None
        text = ""
        if part is None:
            for p in m.walk():
                if p.get_content_type() == "text/plain":
                    text = p.get_payload(decode=True).decode(errors="replace")
                    break
        else:
            text = part.get_payload(decode=True).decode(errors="replace")
        first = text.strip().splitlines()[0] if text.strip() else ""
        if first.strip().lower().strip(".!") in {"no", "no thanks", "unsubscribe", "stop", "remove"}:
            optouts.add(sender)
        print(f"{sent[sender]} <{sender}>: {first[:160]}")
    OPTOUT.write_text(json.dumps(sorted(optouts), indent=2))
    imap.logout()


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "send":
        send(sys.argv[2], "--live" in sys.argv)
    elif len(sys.argv) >= 2 and sys.argv[1] == "replies":
        replies()
    else:
        print(__doc__)

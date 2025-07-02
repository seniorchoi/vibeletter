import os
from datetime import datetime, timedelta

from flask import Flask, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail, Message
from apscheduler.schedulers.background import BackgroundScheduler
from pytz import timezone
import openai
from dotenv import load_dotenv

load_dotenv()

# ─── Flask & Config ────────────────────────────────────────────────────────────
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

# ─── Extensions ────────────────────────────────────────────────────────────────
db = SQLAlchemy(app)
migrate = Migrate(app, db)
mail = Mail(app)
openai.api_key = os.getenv('OPENAI_API_KEY')

# ─── Models ────────────────────────────────────────────────────────────────────
class Newsletter(db.Model):
    __tablename__ = 'newsletters'
    id         = db.Column(db.String, primary_key=True, default=lambda: os.urandom(16).hex())
    name       = db.Column(db.Text, nullable=False)
    prompt     = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class NewsletterIssue(db.Model):
    __tablename__ = 'newsletter_issues'
    id                 = db.Column(db.String, primary_key=True, default=lambda: os.urandom(16).hex())
    newsletter_id      = db.Column(db.String, db.ForeignKey('newsletters.id', ondelete='CASCADE'), nullable=False)
    content            = db.Column(db.Text, nullable=False)
    scheduled_send_at  = db.Column(db.DateTime, nullable=False)
    sent_at            = db.Column(db.DateTime)
    newsletter         = db.relationship('Newsletter', backref='issues')

class Subscriber(db.Model):
    __tablename__ = 'subscribers'
    id             = db.Column(db.String, primary_key=True, default=lambda: os.urandom(16).hex())
    newsletter_id  = db.Column(db.String, db.ForeignKey('newsletters.id', ondelete='CASCADE'), nullable=False)
    email          = db.Column(db.String, nullable=False, unique=True)
    signed_up_at   = db.Column(db.DateTime, default=datetime.utcnow)
    newsletter     = db.relationship('Newsletter', backref='subscribers')

# ─── API Routes ────────────────────────────────────────────────────────────────
@app.route('/api/newsletters', methods=['POST'])
def create_newsletter():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('prompt'):
        abort(400, 'name and prompt required')
    nl = Newsletter(name=data['name'], prompt=data['prompt'])
    db.session.add(nl)
    db.session.commit()
    return jsonify(id=nl.id, name=nl.name, prompt=nl.prompt, created_at=nl.created_at.isoformat()), 201

@app.route('/api/newsletters', methods=['GET'])
def list_newsletters():
    all_nl = Newsletter.query.order_by(Newsletter.created_at.desc()).all()
    return jsonify([{
        'id': nl.id,
        'name': nl.name,
        'prompt': nl.prompt,
        'created_at': nl.created_at.isoformat(),
        'subscriber_count': len(nl.subscribers)
    } for nl in all_nl])

@app.route('/api/newsletters/<nid>/subscribe', methods=['POST'])
def subscribe(nid):
    data = request.get_json()
    email = data.get('email')
    if not email:
        abort(400, 'email required')
    sub = Subscriber(newsletter_id=nid, email=email)
    db.session.add(sub)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        abort(400, 'email already subscribed?')
    return '', 201

@app.route('/api/newsletters/<nid>/issues', methods=['POST'])
def create_issue(nid):
    nl = Newsletter.query.get_or_404(nid)
    # ChatGPT generate content
    resp = openai.ChatCompletion.create(
        model='gpt-4o-mini',
        messages=[
            {'role':'system','content':'Write a newsletter issue with the tone of a friendly AI assistant.'},
            {'role':'user','content': nl.prompt}
        ]
    )
    content = resp.choices[0].message.content
    # schedule for tomorrow at 9am
    send_at = datetime.utcnow().replace(hour=9, minute=0, second=0) + timedelta(days=1)
    issue = NewsletterIssue(newsletter_id=nid, content=content, scheduled_send_at=send_at)
    db.session.add(issue)
    db.session.commit()
    return jsonify(id=issue.id, scheduled_send_at=issue.scheduled_send_at.isoformat()), 201

# ─── Email‐sending job ─────────────────────────────────────────────────────────
def send_pending_issues():
    now = datetime.utcnow()
    pending = NewsletterIssue.query.filter(
        NewsletterIssue.sent_at.is_(None),
        NewsletterIssue.scheduled_send_at <= now
    ).all()

    for issue in pending:
        for sub in issue.newsletter.subscribers:
            msg = Message(
                subject=f"Your Vibeletter – {issue.newsletter.name}",
                recipients=[sub.email],
                html=f"<pre>{issue.content}</pre>"
            )
            try:
                mail.send(msg)
            except Exception as e:
                app.logger.error(f"Failed to send to {sub.email}: {e}")
        issue.sent_at = now
    db.session.commit()


def daily_generate_and_send():
    now = datetime.now(timezone('Asia/Seoul'))
    # 1) Fetch every active newsletter
    all_nl = Newsletter.query.all()
    for nl in all_nl:
        # 2) Generate today’s issue
        resp = openai.ChatCompletion.create(
            model='gpt-4o-mini',
            messages=[
                {'role':'system','content':'Write a friendly, informative newsletter issue.'},
                {'role':'user','content': nl.prompt}
            ]
        )
        content = resp.choices[0].message.content

        # 3) Send immediately to subscribers
        for sub in nl.subscribers:
            msg = Message(
                subject=f"Your Vibeletter – {nl.name}",
                recipients=[sub.email],
                html=f"<pre>{content}</pre>"
            )
            try:
                mail.send(msg)
            except Exception as e:
                app.logger.error(f"Error sending to {sub.email}: {e}")

        # 4) (Optional) Record that you sent it
        issue = NewsletterIssue(
            newsletter_id=nl.id,
            content=content,
            scheduled_send_at=now,
            sent_at=now
        )
        db.session.add(issue)

    db.session.commit()



# ─── Scheduler ────────────────────────────────────────────────────────────────
scheduler = BackgroundScheduler(timezone=timezone('Asia/Seoul'))
# Run every day at 09:00 Seoul time
scheduler.add_job(daily_generate_and_send, 'cron', hour=9, minute=0)
scheduler.start()

# ─── Launch ───────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    # auto-create tables (for dev only)
    with app.app_context():
        db.create_all()
    app.run(port=5000, debug=True)

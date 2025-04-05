from typing import List, Dict, Optional, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json
from pathlib import Path
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
import asyncio
import aiosmtplib
from .investor_profile import InvestorProfile
import aiohttp
import asyncio
from enum import Enum
import telegram
from twilio.rest import Client
import slack_sdk
import websockets
import os

class AlertChannel(Enum):
    EMAIL = "email"
    SMS = "sms"
    TELEGRAM = "telegram"
    SLACK = "slack"
    WEBSOCKET = "websocket"
    PUSH = "push"

@dataclass
class AlertChannelConfig:
    channel: AlertChannel
    enabled: bool
    config: Dict[str, str]

@dataclass
class Alert:
    id: str
    investor_id: str
    opportunity_id: str
    title: str
    description: str
    match_score: float
    timestamp: datetime
    expires_at: datetime
    priority: str
    status: str = "pending"  # pending, sent, read, expired
    notification_attempts: int = 0
    channels: List[AlertChannelConfig]
    delivery_status: Dict[str, str] = field(default_factory=dict)
    retry_count: Dict[str, int] = field(default_factory=dict)

class AlertManager:
    def __init__(self, email_config: Dict[str, str]):
        """Initialize the Alert Manager with enhanced configuration."""
        self.email_config = email_config
        self.alert_template = self._load_alert_template()
        self.alerts: Dict[str, Alert] = {}
        self.alert_preferences: Dict[str, Dict] = {}
        self.websocket_connections: Dict[str, List[websockets.WebSocketServerProtocol]] = {}
        
        # Initialize notification clients
        self.telegram_bot = telegram.Bot(token=os.getenv("TELEGRAM_BOT_TOKEN"))
        self.twilio_client = Client(
            os.getenv("TWILIO_ACCOUNT_SID"),
            os.getenv("TWILIO_AUTH_TOKEN")
        )
        self.slack_client = slack_sdk.WebClient(token=os.getenv("SLACK_BOT_TOKEN"))
        
        self._load_existing_alerts()
        self._load_alert_preferences()

    def _load_alert_template(self) -> Template:
        """Load the email template for alerts."""
        template_str = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .alert { padding: 20px; background: #f8f9fa; border-radius: 5px; }
                .priority-high { border-left: 4px solid #dc3545; }
                .priority-medium { border-left: 4px solid #ffc107; }
                .priority-low { border-left: 4px solid #28a745; }
                .match-score { 
                    display: inline-block;
                    padding: 5px 10px;
                    background: #007bff;
                    color: white;
                    border-radius: 15px;
                    font-size: 0.9em;
                }
                .details { margin-top: 15px; }
                .cta-button {
                    display: inline-block;
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 15px;
                }
                .footer { margin-top: 20px; font-size: 0.8em; color: #6c757d; }
            </style>
        </head>
        <body>
            <div class="alert priority-{{ alert.priority }}">
                <h2>{{ alert.title }}</h2>
                <span class="match-score">Match Score: {{ "%.0f"|format(alert.match_score * 100) }}%</span>
                
                <div class="details">
                    {{ alert.description|replace('\n', '<br>') }}
                </div>
                
                <a href="{{ view_url }}" class="cta-button">View Opportunity</a>
            </div>
            
            <div class="footer">
                <p>This is a private alert based on your investment preferences.</p>
                <p>Alert expires: {{ alert.expires_at.strftime('%Y-%m-%d %H:%M UTC') }}</p>
            </div>
        </body>
        </html>
        """
        return Template(template_str)

    def _load_existing_alerts(self, base_path: str = "data/alerts"):
        """Load existing alerts from storage."""
        path = Path(base_path)
        if not path.exists():
            path.mkdir(parents=True)
            return

        for file in path.glob("*.json"):
            with open(file, "r") as f:
                data = json.load(f)
                alert = Alert(
                    id=data["id"],
                    investor_id=data["investor_id"],
                    opportunity_id=data["opportunity_id"],
                    title=data["title"],
                    description=data["description"],
                    match_score=data["match_score"],
                    timestamp=datetime.fromisoformat(data["timestamp"]),
                    expires_at=datetime.fromisoformat(data["expires_at"]),
                    priority=data["priority"],
                    status=data["status"],
                    notification_attempts=data["notification_attempts"],
                    channels=[],
                    delivery_status={},
                    retry_count={}
                )
                self.alerts[alert.id] = alert

    def _load_alert_preferences(self, base_path: str = "data/alert_preferences"):
        """Load alert preferences for investors."""
        path = Path(base_path)
        if not path.exists():
            path.mkdir(parents=True)
            return

        for file in path.glob("*.json"):
            with open(file, "r") as f:
                data = json.load(f)
                self.alert_preferences[data["investor_id"]] = data

    def save_alert_preferences(self, investor_id: str, preferences: Dict, base_path: str = "data/alert_preferences"):
        """Save alert preferences for an investor."""
        path = Path(base_path)
        path.mkdir(parents=True, exist_ok=True)
        
        with open(path / f"{investor_id}_preferences.json", "w") as f:
            json.dump(preferences, f, indent=2)
        
        self.alert_preferences[investor_id] = preferences

    async def send_alert(self, alert: Alert, investor_email: str, view_url: str) -> Dict[str, bool]:
        """Send alert through multiple channels."""
        results = {}
        
        for channel_config in alert.channels:
            if not channel_config.enabled:
                continue
            
            try:
                if channel_config.channel == AlertChannel.EMAIL:
                    success = await self.send_alert_email(alert, investor_email, view_url)
                elif channel_config.channel == AlertChannel.SMS:
                    success = await self.send_alert_sms(alert, channel_config.config["phone"])
                elif channel_config.channel == AlertChannel.TELEGRAM:
                    success = await self.send_alert_telegram(alert, channel_config.config["chat_id"])
                elif channel_config.channel == AlertChannel.SLACK:
                    success = await self.send_alert_slack(alert, channel_config.config["channel"])
                elif channel_config.channel == AlertChannel.WEBSOCKET:
                    success = await self.send_alert_websocket(alert, channel_config.config["connection_id"])
                elif channel_config.channel == AlertChannel.PUSH:
                    success = await self.send_push_notification(alert, channel_config.config["device_token"])
                
                results[channel_config.channel.value] = success
                alert.delivery_status[channel_config.channel.value] = "delivered" if success else "failed"
                
                if not success:
                    alert.retry_count[channel_config.channel.value] = \
                        alert.retry_count.get(channel_config.channel.value, 0) + 1
            except Exception as e:
                print(f"Error sending alert via {channel_config.channel}: {str(e)}")
                results[channel_config.channel.value] = False
                alert.delivery_status[channel_config.channel.value] = "error"
        
        self._save_alert(alert)
        return results

    async def send_alert_sms(self, alert: Alert, phone_number: str) -> bool:
        """Send alert via SMS using Twilio."""
        try:
            message = self.twilio_client.messages.create(
                body=f"{alert.title}\n\n{alert.description}",
                from_=os.getenv("TWILIO_PHONE_NUMBER"),
                to=phone_number
            )
            return True
        except Exception as e:
            print(f"SMS delivery failed: {str(e)}")
            return False

    async def send_alert_telegram(self, alert: Alert, chat_id: str) -> bool:
        """Send alert via Telegram."""
        try:
            message = f"*{alert.title}*\n\n{alert.description}"
            await self.telegram_bot.send_message(
                chat_id=chat_id,
                text=message,
                parse_mode="Markdown"
            )
            return True
        except Exception as e:
            print(f"Telegram delivery failed: {str(e)}")
            return False

    async def send_alert_slack(self, alert: Alert, channel: str) -> bool:
        """Send alert via Slack."""
        try:
            blocks = [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": alert.title
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": alert.description
                    }
                }
            ]
            
            response = self.slack_client.chat_postMessage(
                channel=channel,
                blocks=blocks
            )
            return response["ok"]
        except Exception as e:
            print(f"Slack delivery failed: {str(e)}")
            return False

    async def send_alert_websocket(self, alert: Alert, connection_id: str) -> bool:
        """Send alert via WebSocket."""
        if connection_id not in self.websocket_connections:
            return False
        
        message = {
            "type": "alert",
            "data": {
                "id": alert.id,
                "title": alert.title,
                "description": alert.description,
                "priority": alert.priority,
                "timestamp": alert.timestamp.isoformat()
            }
        }
        
        try:
            for connection in self.websocket_connections[connection_id]:
                await connection.send(json.dumps(message))
            return True
        except Exception as e:
            print(f"WebSocket delivery failed: {str(e)}")
            return False

    async def send_push_notification(self, alert: Alert, device_token: str) -> bool:
        """Send push notification."""
        try:
            # Example using Firebase Cloud Messaging
            url = "https://fcm.googleapis.com/fcm/send"
            headers = {
                "Authorization": f"key={os.getenv('FCM_SERVER_KEY')}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "to": device_token,
                "notification": {
                    "title": alert.title,
                    "body": alert.description,
                    "priority": "high" if alert.priority == "urgent" else "normal"
                },
                "data": {
                    "alert_id": alert.id,
                    "opportunity_id": alert.opportunity_id
                }
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    return response.status == 200
        except Exception as e:
            print(f"Push notification failed: {str(e)}")
            return False

    async def register_websocket(self, investor_id: str, connection: websockets.WebSocketServerProtocol):
        """Register a WebSocket connection for an investor."""
        if investor_id not in self.websocket_connections:
            self.websocket_connections[investor_id] = []
        self.websocket_connections[investor_id].append(connection)

    async def unregister_websocket(self, investor_id: str, connection: websockets.WebSocketServerProtocol):
        """Unregister a WebSocket connection."""
        if investor_id in self.websocket_connections:
            self.websocket_connections[investor_id].remove(connection)

    def create_alert(self, 
                    investor: InvestorProfile, 
                    opportunity: Dict,
                    match_score: float,
                    expiration_hours: int = 48,
                    additional_data: Dict = None) -> Alert:
        """Enhanced alert creation with multiple channels."""
        # Get investor preferences
        preferences = self.alert_preferences.get(investor.id, {})
        
        # Create alert channels based on preferences
        channels = []
        if "email" in preferences.get("channels", ["email"]):
            channels.append(AlertChannelConfig(
                channel=AlertChannel.EMAIL,
                enabled=True,
                config={"email": preferences.get("email")}
            ))
        
        if "sms" in preferences.get("channels", []):
            channels.append(AlertChannelConfig(
                channel=AlertChannel.SMS,
                enabled=True,
                config={"phone": preferences.get("phone")}
            ))
        
        if "telegram" in preferences.get("channels", []):
            channels.append(AlertChannelConfig(
                channel=AlertChannel.TELEGRAM,
                enabled=True,
                config={"chat_id": preferences.get("telegram_chat_id")}
            ))
        
        if "slack" in preferences.get("channels", []):
            channels.append(AlertChannelConfig(
                channel=AlertChannel.SLACK,
                enabled=True,
                config={"channel": preferences.get("slack_channel")}
            ))
        
        if "websocket" in preferences.get("channels", []):
            channels.append(AlertChannelConfig(
                channel=AlertChannel.WEBSOCKET,
                enabled=True,
                config={"connection_id": investor.id}
            ))
        
        if "push" in preferences.get("channels", []):
            channels.append(AlertChannelConfig(
                channel=AlertChannel.PUSH,
                enabled=True,
                config={"device_token": preferences.get("device_token")}
            ))
        
        # Create alert with enhanced description and channels
        description = self._generate_enhanced_description(opportunity, match_score, additional_data)
        
        alert = Alert(
            id=f"alert_{len(self.alerts) + 1}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            investor_id=investor.id,
            opportunity_id=opportunity["id"],
            title=self._generate_alert_title(opportunity),
            description=description,
            match_score=match_score,
            timestamp=datetime.now(),
            expires_at=datetime.now() + timedelta(hours=expiration_hours),
            priority=self._calculate_priority(match_score, opportunity),
            channels=channels
        )
        
        self.alerts[alert.id] = alert
        self._save_alert(alert)
        
        return alert

    def _generate_enhanced_description(self, opportunity: Dict, match_score: float, additional_data: Dict = None) -> str:
        """Generate enhanced alert description with detailed information."""
        description = f"""Exclusive opportunity matching your investment profile:
                         {opportunity['name']} ({opportunity['sector']})
                         Investment range: €{opportunity['investment_amount']:,.2f}
                         Location: {opportunity['location']}
                         Deal type: {opportunity['deal_type']}"""
        
        if additional_data:
            if "key_metrics" in additional_data:
                description += "\n\nKey Metrics:"
                for metric, value in additional_data["key_metrics"].items():
                    description += f"\n- {metric}: {value}"
            
            if "competitive_advantages" in additional_data:
                description += "\n\nCompetitive Advantages:"
                for advantage in additional_data["competitive_advantages"]:
                    description += f"\n- {advantage}"
            
            if "team_highlights" in additional_data:
                description += "\n\nTeam Highlights:"
                for highlight in additional_data["team_highlights"]:
                    description += f"\n- {highlight}"
        
        return description

    def _generate_alert_title(self, opportunity: Dict) -> str:
        """Generate attention-grabbing alert title."""
        sector_emoji = {
            "technology": "💻",
            "e-commerce": "🛒",
            "healthcare": "⚕️",
            "fintech": "💳",
            "real_estate": "🏢",
            "tourism": "✈️",
            "education": "📚",
            "manufacturing": "🏭"
        }
        
        emoji = sector_emoji.get(opportunity["sector"].lower(), "🎯")
        return f"{emoji} New {opportunity['sector']} Investment Opportunity: {opportunity['name']}"

    def _calculate_priority(self, match_score: float, opportunity: Dict) -> str:
        """Calculate alert priority based on multiple factors."""
        priority_score = match_score
        
        # Adjust for deal urgency
        if opportunity.get("urgent", False):
            priority_score += 0.2
        
        # Adjust for deal size
        if opportunity["investment_amount"] >= 10000000:  # €10M+
            priority_score += 0.1
        
        # Adjust for competitive situation
        if opportunity.get("competitive_situation", False):
            priority_score += 0.1
        
        if priority_score >= 0.9:
            return "urgent"
        elif priority_score >= 0.7:
            return "high"
        elif priority_score >= 0.5:
            return "medium"
        return "low"

    async def _schedule_followup(self, alert: Alert):
        """Schedule follow-up notifications for unread alerts."""
        followup_delays = [24, 48, 72]  # Hours after initial alert
        
        for delay in followup_delays:
            await asyncio.sleep(delay * 3600)  # Convert hours to seconds
            
            # Check if alert still needs follow-up
            if alert.id in self.alerts and self.alerts[alert.id].status == "sent":
                followup_alert = Alert(
                    id=f"{alert.id}_followup_{delay}",
                    investor_id=alert.investor_id,
                    opportunity_id=alert.opportunity_id,
                    title=f"Reminder: {alert.title}",
                    description=f"Don't miss this opportunity!\n\n{alert.description}",
                    match_score=alert.match_score,
                    timestamp=datetime.now(),
                    expires_at=alert.expires_at,
                    priority=alert.priority,
                    status="pending"
                )
                
                self.alerts[followup_alert.id] = followup_alert
                self._save_alert(followup_alert)

    def get_alert_statistics(self, investor_id: str) -> Dict:
        """Get statistics about alerts for an investor."""
        investor_alerts = [
            alert for alert in self.alerts.values()
            if alert.investor_id == investor_id
        ]
        
        return {
            "total_alerts": len(investor_alerts),
            "read_alerts": sum(1 for a in investor_alerts if a.status == "read"),
            "expired_alerts": sum(1 for a in investor_alerts if a.status == "expired"),
            "average_match_score": sum(a.match_score for a in investor_alerts) / len(investor_alerts) if investor_alerts else 0,
            "by_priority": {
                "urgent": sum(1 for a in investor_alerts if a.priority == "urgent"),
                "high": sum(1 for a in investor_alerts if a.priority == "high"),
                "medium": sum(1 for a in investor_alerts if a.priority == "medium"),
                "low": sum(1 for a in investor_alerts if a.priority == "low")
            }
        }

    def _save_alert(self, alert: Alert, base_path: str = "data/alerts"):
        """Save alert to storage."""
        path = Path(base_path)
        path.mkdir(parents=True, exist_ok=True)
        
        alert_data = {
            "id": alert.id,
            "investor_id": alert.investor_id,
            "opportunity_id": alert.opportunity_id,
            "title": alert.title,
            "description": alert.description,
            "match_score": alert.match_score,
            "timestamp": alert.timestamp.isoformat(),
            "expires_at": alert.expires_at.isoformat(),
            "priority": alert.priority,
            "status": alert.status,
            "notification_attempts": alert.notification_attempts,
            "channels": [
                {
                    "channel": channel.channel.value,
                    "enabled": channel.enabled,
                    "config": channel.config
                } for channel in alert.channels
            ],
            "delivery_status": alert.delivery_status,
            "retry_count": alert.retry_count
        }
        
        with open(path / f"{alert.id}.json", "w") as f:
            json.dump(alert_data, f, indent=2)

    async def send_alert_email(self, alert: Alert, investor_email: str, view_url: str) -> bool:
        """Send alert email asynchronously."""
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = f"Private Investment Alert: {alert.title}"
            message["From"] = self.email_config["sender"]
            message["To"] = investor_email
            
            # Render HTML content
            html_content = self.alert_template.render(
                alert=alert,
                view_url=view_url
            )
            
            message.attach(MIMEText(html_content, "html"))
            
            # Send email asynchronously
            await aiosmtplib.send(
                message,
                hostname=self.email_config["smtp_server"],
                port=self.email_config["smtp_port"],
                username=self.email_config["username"],
                password=self.email_config["password"],
                use_tls=True
            )
            
            alert.status = "sent"
            alert.notification_attempts += 1
            self._save_alert(alert)
            return True
            
        except Exception as e:
            print(f"Failed to send alert email: {str(e)}")
            return False

    async def process_pending_alerts(self, get_investor_email_func) -> List[Dict]:
        """Process all pending alerts."""
        results = []
        current_time = datetime.now()
        
        for alert in self.alerts.values():
            if alert.status == "pending" and alert.expires_at > current_time:
                investor_email = get_investor_email_func(alert.investor_id)
                view_url = f"https://yourplatform.com/opportunities/{alert.opportunity_id}"
                
                results.append({
                    "alert_id": alert.id,
                    "investor_id": alert.investor_id,
                    "success": await self.send_alert(alert, investor_email, view_url)
                })
        
        return results

    def mark_alert_read(self, alert_id: str):
        """Mark an alert as read."""
        if alert_id in self.alerts:
            self.alerts[alert_id].status = "read"
            self._save_alert(self.alerts[alert_id])

    def cleanup_expired_alerts(self):
        """Clean up expired alerts."""
        current_time = datetime.now()
        expired_alerts = [
            alert_id for alert_id, alert in self.alerts.items()
            if alert.expires_at < current_time
        ]
        
        for alert_id in expired_alerts:
            alert = self.alerts[alert_id]
            alert.status = "expired"
            self._save_alert(alert)

    def get_investor_alerts(self, investor_id: str, include_expired: bool = False) -> List[Alert]:
        """Get all alerts for a specific investor."""
        current_time = datetime.now()
        return [
            alert for alert in self.alerts.values()
            if alert.investor_id == investor_id and
            (include_expired or alert.expires_at > current_time)
        ]

    async def retry_failed_alerts(self):
        """Retry sending failed alerts."""
        for alert in self.alerts.values():
            for channel in alert.channels:
                channel_name = channel.channel.value
                if (
                    alert.delivery_status.get(channel_name) in ["failed", "error"] and
                    alert.retry_count.get(channel_name, 0) < 3
                ):
                    # Retry sending the alert
                    if channel.channel == AlertChannel.EMAIL:
                        success = await self.send_alert_email(
                            alert,
                            channel.config["email"],
                            f"https://yourplatform.com/opportunities/{alert.opportunity_id}"
                        )
                    elif channel.channel == AlertChannel.SMS:
                        success = await self.send_alert_sms(alert, channel.config["phone"])
                    elif channel.channel == AlertChannel.TELEGRAM:
                        success = await self.send_alert_telegram(alert, channel.config["chat_id"])
                    elif channel.channel == AlertChannel.SLACK:
                        success = await self.send_alert_slack(alert, channel.config["channel"])
                    elif channel.channel == AlertChannel.WEBSOCKET:
                        success = await self.send_alert_websocket(alert, channel.config["connection_id"])
                    elif channel.channel == AlertChannel.PUSH:
                        success = await self.send_push_notification(alert, channel.config["device_token"])
                    
                    if success:
                        alert.delivery_status[channel_name] = "delivered"
                    else:
                        alert.retry_count[channel_name] = alert.retry_count.get(channel_name, 0) + 1
                    
                    self._save_alert(alert) 
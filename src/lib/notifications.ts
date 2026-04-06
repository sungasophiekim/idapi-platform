// src/lib/notifications.ts
// Notification system — logs to DB, optionally sends email via webhook
// Connect to any email provider (SendGrid, Resend, etc.) by setting NOTIFICATION_WEBHOOK_URL

import { prisma } from './db';

export type NotificationType = 'NEW_BRIEFING' | 'REGULATION_UPDATE' | 'TREND_SPIKE' | 'NEW_POST' | 'SYSTEM';

interface NotificationPayload {
  type: NotificationType;
  title: string;
  titleEn?: string;
  message: string;
  messageEn?: string;
  metadata?: Record<string, unknown>;
}

export async function sendNotification(payload: NotificationPayload) {
  // 1. Store in DB
  try {
    await prisma.siteSetting.upsert({
      where: { key: `notification_${Date.now()}` },
      update: {},
      create: {
        key: `notification_${Date.now()}`,
        value: JSON.stringify({
          ...payload,
          createdAt: new Date().toISOString(),
          read: false,
        }),
      },
    });
  } catch {
    console.error('Failed to store notification');
  }

  // 2. Send via webhook if configured
  const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: payload.type,
          title: payload.title,
          message: payload.message,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      console.error('Failed to send webhook notification');
    }
  }

  // 3. Send email if configured (Resend / SendGrid)
  const emailApiKey = process.env.EMAIL_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const emailTo = process.env.EMAIL_ADMIN_TO;

  if (emailApiKey && emailFrom && emailTo) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${emailApiKey}`,
        },
        body: JSON.stringify({
          from: emailFrom,
          to: emailTo.split(','),
          subject: `[IDAPI] ${payload.title}`,
          html: `
            <h2>${payload.title}</h2>
            <p>${payload.message}</p>
            <hr/>
            <p style="color:#888;font-size:12px">IDAPI Platform Notification</p>
          `,
        }),
      });
    } catch {
      console.error('Failed to send email notification');
    }
  }
}

// Convenience functions
export async function notifyNewBriefing(title: string) {
  await sendNotification({
    type: 'NEW_BRIEFING',
    title: `새 브리핑 생성: ${title}`,
    titleEn: `New Briefing: ${title}`,
    message: `AI 브리핑이 생성되었습니다. Admin에서 확인 후 게시해주세요.`,
    messageEn: `An AI briefing has been generated. Please review and publish in Admin.`,
  });
}

export async function notifyRegulationUpdate(title: string, oldStatus: string, newStatus: string) {
  await sendNotification({
    type: 'REGULATION_UPDATE',
    title: `규제 상태 변경: ${title}`,
    titleEn: `Regulation Update: ${title}`,
    message: `상태가 ${oldStatus} → ${newStatus}로 변경되었습니다.`,
    messageEn: `Status changed from ${oldStatus} to ${newStatus}.`,
  });
}

export async function notifyTrendSpike(keyword: string, score: number) {
  await sendNotification({
    type: 'TREND_SPIKE',
    title: `트렌드 급등: ${keyword}`,
    titleEn: `Trend Spike: ${keyword}`,
    message: `키워드 "${keyword}"의 점수가 ${score}로 급등했습니다.`,
    messageEn: `Keyword "${keyword}" spiked to score ${score}.`,
  });
}

export async function notifyNewPost(title: string) {
  await sendNotification({
    type: 'NEW_POST',
    title: `새 게시물 발행: ${title}`,
    titleEn: `New Post Published: ${title}`,
    message: `새로운 연구자료가 게시되었습니다.`,
    messageEn: `A new research publication has been posted.`,
  });
}

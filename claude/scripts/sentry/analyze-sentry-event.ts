import { getEventApiCalls } from '@/sentry/get-sentry-event-api-calls';
import { getSentryIssue } from '@/sentry/get-sentry-issue';
import { getSentryIssueEvent } from '@/sentry/get-sentry-issue-event';

interface AnalyzeOptions {
  issueId: string;
}

/**
 * 分析 Sentry Issue 和 Event 的完整报告
 */
export async function analyzeSentryEvent(options: AnalyzeOptions) {
  const { issueId } = options;
  const issue = await getSentryIssue({ issueId });
  const event = await getSentryIssueEvent({ issueId });
  const apiCalls = await getEventApiCalls({ issueId });

  // 4. 提取错误堆栈
  const exception = extractException(event);

  // 5. 提取触摸事件
  const touchEvents = extractTouchEvents(event);

  // 6. 提取设备信息
  const deviceInfo = extractDeviceInfo(event);

  if (!issue || !event) return;

  return {
    issue: {
      id: issue.id,
      title: issue.title,
      culprit: issue.culprit,
      level: issue.level,
      status: issue.status,
      count: issue.count,
      userCount: issue.userCount,
      firstSeen: issue.firstSeen,
      lastSeen: issue.lastSeen,
      permalink: issue.permalink,
    },
    event: {
      id: event.id,
      timestamp: event.dateCreated,
    },
    exception,
    apiCalls,
    touchEvents,
    deviceInfo,
  };
}

function extractException(event: any) {
  if (!event.entries) return null;

  const exceptionEntry = event.entries.find((e: any) => e.type === 'exception');
  if (!exceptionEntry || !exceptionEntry.data || !exceptionEntry.data.values)
    return null;

  const exc = exceptionEntry.data.values[0];
  return {
    type: exc.type,
    value: exc.value,
    mechanism: exc.mechanism,
    stacktrace:
      exc.stacktrace?.frames?.map((frame: any) => ({
        function: frame.function,
        filename: frame.filename,
        lineNo: frame.lineNo,
        colNo: frame.colNo,
      })) || [],
  };
}

function extractTouchEvents(event: any) {
  if (!event.entries) return [];

  const breadcrumbsEntry = event.entries.find(
    (e: any) => e.type === 'breadcrumbs'
  );
  const breadcrumbs = breadcrumbsEntry?.data?.values || [];

  return breadcrumbs
    .filter((b: any) => b.type === 'user' && b.category === 'touch')
    .map((b: any) => ({
      message: b.message,
      timestamp: b.timestamp,
      path: b.data?.path?.map((p: any) => p.name) || [],
    }));
}

function extractDeviceInfo(event: any) {
  const contexts = event.contexts || {};
  return {
    app: {
      name: contexts.app?.app_name,
      version: contexts.app?.app_version,
      build: contexts.app?.app_build,
    },
    device: {
      brand: contexts.device?.brand,
      model: contexts.device?.model,
      manufacturer: contexts.device?.manufacturer,
    },
    os: {
      name: contexts.os?.name,
      version: contexts.os?.version,
    },
    reactNative: {
      version: contexts.react_native_context?.react_native_version,
      jsEngine: contexts.react_native_context?.js_engine,
    },
  };
}

// CLI 入口
const issueId = process.argv[2];

if (issueId) {
  analyzeSentryEvent({ issueId }).then((result) => {
    console.log(JSON.stringify(result));
  });
}

/**
 * xAPI 事件服務：攔截 H5P 事件並回傳後端
 */
import type { XapiOptions } from '../types/h5p';

/** 重試延遲毫秒 */
const RETRY_DELAYS = [500, 1000, 2000];

export function initXapiService(opts: XapiOptions) {
  const dispatcher = (window as any).H5P?.externalDispatcher;
  if (!dispatcher) return;

  dispatcher.on('xAPI', async (event: any) => {
    const stmt = event.data.statement;
    stmt.actor = stmt.actor || { account: { name: opts.userId } };
    stmt.context = stmt.context || { extensions: {} };
    stmt.context.extensions.contentId = opts.contentId;
    stmt.context.extensions.sessionId = opts.sessionId;
    await postWithRetry(stmt, opts);
  });
}

async function postWithRetry(stmt: any, opts: XapiOptions) {
  for (let i = 0; i <= RETRY_DELAYS.length; i++) {
    try {
      await fetch(opts.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [opts.tokenHeaderName]: opts.tokenValue
        },
        body: JSON.stringify(stmt)
      });
      return;
    } catch (e) {
      if (i === RETRY_DELAYS.length) throw e;
      await wait(RETRY_DELAYS[i]);
    }
  }
}

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

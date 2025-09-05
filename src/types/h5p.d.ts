export interface H5PStandalone {
  resize?: () => void;
  destroy?: () => void;
}

export interface XapiOptions {
  endpoint: string;
  tokenHeaderName: string;
  tokenValue: string;
  userId: string;
  contentId: string;
  sessionId: string;
}

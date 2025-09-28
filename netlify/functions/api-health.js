export const handler = async () => {
  const body = {
    status: "ok",
    service: "astromahri.space",
    time: new Date().toISOString(),
    context: process.env.CONTEXT || null,
    branch: process.env.BRANCH || null,
    commit: process.env.COMMIT_REF || null,
    url: process.env.URL || null,
    deploy_url: process.env.DEPLOY_URL || null,
    node: process.version,
  };

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-cache, no-store, must-revalidate",
    },
    body: JSON.stringify(body),
  };
};

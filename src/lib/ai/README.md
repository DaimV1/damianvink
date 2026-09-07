# AI Lab

`/ai-lab` provides three bilingual text workflows and explicitly labelled prepared examples. Examples never call the provider; edited input is never represented as processed by an example. Live generation uses a server function and the OpenAI Responses API, with same-site enforcement, validated inputs, a 25-second timeout and an 800-token output cap. Provider failures and partial responses are not shown as successful results. No prompts or keys are logged or persisted by this feature. OpenAI receives live input (`store: false` is requested; provider retention rules still apply).

Set server-side `OPENAI_API_KEY`, optional `OPENAI_MODEL` (default `gpt-4.1-mini`), and `AI_DEMO_ENABLED=true` in the hosting environment to enable live requests. Do not put keys in client variables. Set provider spending controls and hosting rate limits before enabling a public deployment. The 10 requests/minute in-process guard is best-effort per instance and resets on cold starts; it is not a distributed limit or budget guarantee. With no configuration the curated examples remain usable, and live attempts show an explicit unavailable message.

API reference: https://developers.openai.com/api/reference/resources/responses/methods/create/

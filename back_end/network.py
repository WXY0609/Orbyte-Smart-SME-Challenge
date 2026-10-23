import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def json_request(url, payload=None, headers=None, timeout=25):
    req = Request(url, data=json.dumps(payload).encode() if payload is not None else None,
                  headers={"Content-Type": "application/json", "User-Agent": "Orbyte-SME/1.0", **(headers or {})})
    try:
        with urlopen(req, timeout=timeout) as response:
            return json.load(response)
    except HTTPError as exc:
        if exc.code == 429:
            raise ConnectionError("The provider is rate limited. Please try again later.") from exc
        if exc.code in [401, 402, 403]:
            raise ConnectionError("Provider access was rejected. Check the backend API key, credits and model access.") from exc
        raise ConnectionError(f"Provider request failed (HTTP {exc.code}). Please retry.") from exc
    except (URLError, TimeoutError, OSError, ValueError) as exc:
        raise ConnectionError("The provider timed out, is unreachable, or returned an invalid response.") from exc

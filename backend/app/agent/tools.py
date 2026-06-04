from langchain_core.tools import tool
from googleapiclient.discovery import build

from app.agent.config import GOOGLE_CSE_API_KEY, GOOGLE_CSE_CX


@tool
def search_competitor_pricing(query: str) -> str:
    """Search the web for competitor pricing, promotions, or cheaper alternatives
    for a given service provider and bill type. Returns a summary of search results
    including titles, snippets, and links."""
    if not GOOGLE_CSE_API_KEY or not GOOGLE_CSE_CX:
        return "Search unavailable: Google Custom Search API key or CX not configured."

    service = build("customsearch", "v1", developerKey=GOOGLE_CSE_API_KEY)
    result = service.cse().list(q=query, cx=GOOGLE_CSE_CX, num=5).execute()

    items = result.get("items", [])
    if not items:
        return "No search results found."

    results = []
    for item in items:
        title = item.get("title", "")
        snippet = item.get("snippet", "")
        link = item.get("link", "")
        results.append(f"- {title}\n  {snippet}\n  {link}")

    return "\n\n".join(results)


@tool
def calculate_savings(
    current_monthly: float, proposed_monthly: float, cancellation_fee: float = 0.0
) -> str:
    """Calculate annualized savings from switching providers.
    Uses formula: S_annual = 12 * (current - proposed) - fees.
    Returns a formatted savings summary."""
    annual_savings = 12 * (current_monthly - proposed_monthly) - cancellation_fee

    if annual_savings <= 0:
        return (
            f"No savings found. Current: ${current_monthly:.2f}/mo, "
            f"Proposed: ${proposed_monthly:.2f}/mo, "
            f"Fee: ${cancellation_fee:.2f}. "
            f"Net annual: ${annual_savings:.2f}"
        )

    return (
        f"Potential savings found! "
        f"Current: ${current_monthly:.2f}/mo, "
        f"Proposed: ${proposed_monthly:.2f}/mo, "
        f"Cancellation fee: ${cancellation_fee:.2f}. "
        f"Net annual savings: ${annual_savings:.2f}"
    )

import json
import logging

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import BaseTool

from app.agent.config import GEMINI_API_KEY, GEMINI_MODEL
from app.agent.tools import calculate_savings, search_competitor_pricing

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are ChillBill's cost optimization agent. Your job is to find
cheaper alternatives for a user's bills and calculate potential savings.

For each bill you analyze, follow this process:
1. Search for competitor pricing, current promotions, or cheaper alternatives for the
   same type of service (e.g., internet, streaming, insurance).
2. Compare the best alternative price you find against the user's current cost.
3. Use the calculate_savings tool to compute annualized savings.
4. If savings exist, provide a clear finding with:
   - The cheaper alternative provider and their price
   - The annualized savings amount
   - A brief negotiation/action script the user can follow

Be specific with dollar amounts. Only report savings if you find concrete pricing data.
If you cannot find reliable pricing, say so honestly rather than guessing.

IMPORTANT: After your analysis, you MUST output your final answer as a JSON object
with exactly these fields:
{
  "has_savings": true/false,
  "potential_savings": <annual savings as a number, 0 if none>,
  "finding_details": "<one-paragraph explanation of what you found>",
  "action_script": "<step-by-step script for the user to act on this, or null>"
}
"""


def _get_tools() -> list[BaseTool]:
    return [search_competitor_pricing, calculate_savings]


def _create_llm() -> ChatGoogleGenerativeAI:
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is not set")

    return ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        google_api_key=GEMINI_API_KEY,
        temperature=0.2,
    )


def run_optimization_agent(
    provider: str,
    bill_type: str,
    amount: float,
    category: str,
    frequency: str,
) -> dict:
    """Run the optimization agent for a single bill.

    Returns a dict with keys: has_savings, potential_savings, finding_details, action_script
    """
    llm = _create_llm()
    tools = _get_tools()
    llm_with_tools = llm.bind_tools(tools)

    monthly_amount = _normalize_to_monthly(amount, frequency)

    user_message = (
        f"Analyze this bill for potential savings:\n"
        f"- Provider: {provider}\n"
        f"- Service type: {bill_type}\n"
        f"- Category: {category}\n"
        f"- Current cost: ${monthly_amount:.2f}/month "
        f"(${amount:.2f} billed {frequency})\n\n"
        f"Search for cheaper alternatives to {provider} {bill_type} service "
        f"and calculate if switching would save money."
    )

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_message),
    ]

    # Agentic loop: keep calling tools until the LLM produces a final answer
    for _ in range(6):
        response = llm_with_tools.invoke(messages)
        messages.append(response)

        if not response.tool_calls:
            break

        for tool_call in response.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]

            tool_fn = {t.name: t for t in tools}.get(tool_name)
            if tool_fn is None:
                logger.warning("Agent called unknown tool: %s", tool_name)
                continue

            tool_result = tool_fn.invoke(tool_args)

            from langchain_core.messages import ToolMessage

            messages.append(
                ToolMessage(content=str(tool_result), tool_call_id=tool_call["id"])
            )

    # Parse the final response — content may be str or list of parts
    raw_content = response.content
    if isinstance(raw_content, list):
        final_text = " ".join(
            part.get("text", "") if isinstance(part, dict) else str(part)
            for part in raw_content
        ).strip()
    else:
        final_text = str(raw_content) if raw_content else ""
    return _parse_agent_output(final_text)


def _normalize_to_monthly(amount: float, frequency: str) -> float:
    """Convert any billing frequency to a monthly equivalent."""
    multipliers = {
        "weekly": 52 / 12,
        "monthly": 1.0,
        "yearly": 1 / 12,
        "once": 1.0,
    }
    return amount * multipliers.get(frequency, 1.0)


def _parse_agent_output(text: str) -> dict:
    """Extract the JSON result from the agent's final message."""
    default = {
        "has_savings": False,
        "potential_savings": 0.0,
        "finding_details": text if text else "Agent produced no output.",
        "action_script": None,
    }

    if not text:
        return default

    # Try to extract JSON from the response
    try:
        # Look for JSON block in markdown code fences
        if "```json" in text:
            json_str = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            json_str = text.split("```")[1].split("```")[0].strip()
        elif "{" in text and "}" in text:
            start = text.index("{")
            end = text.rindex("}") + 1
            json_str = text[start:end]
        else:
            return {**default, "finding_details": text}

        parsed = json.loads(json_str)
        return {
            "has_savings": bool(parsed.get("has_savings", False)),
            "potential_savings": float(parsed.get("potential_savings", 0)),
            "finding_details": str(
                parsed.get("finding_details", "No details provided.")
            ),
            "action_script": parsed.get("action_script"),
        }
    except (json.JSONDecodeError, ValueError, IndexError) as e:
        logger.warning("Failed to parse agent output as JSON: %s", e)
        return {**default, "finding_details": text}

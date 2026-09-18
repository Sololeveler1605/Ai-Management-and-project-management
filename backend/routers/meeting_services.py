"""
Compatibility shim — processing lives in services.meeting_summarizer_service.
"""

from services.meeting_summarizer_service import (  # noqa: F401
    MeetingSummaryParsed,
    process_meeting,
)

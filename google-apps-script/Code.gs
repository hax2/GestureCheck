const SHEET_NAME = "responses";

const HEADERS = [
  "received_at",
  "participant_id",
  "study_id",
  "session_id",
  "session_started_at",
  "exported_at",
  "collection",
  "source",
  "title",
  "target_word",
  "video_url",
  "order_index",
  "iconicity",
  "sensorimotor_imagery",
  "cultural_familiarity",
  "gesture_description",
  "ambiguities",
  "watch_seconds",
  "response_seconds",
  "submitted_at",
  "participant_notes",
  "raw_payload",
];

function doGet() {
  return jsonResponse({
    ok: true,
    service: "gesture-rating-survey",
    sheet: SHEET_NAME,
  });
}

function doPost(event) {
  try {
    const payload = parsePayload(event);
    const rows = normalizeRows(payload);

    if (rows.length === 0) {
      return jsonResponse({ ok: false, error: "Payload contains no responses." });
    }

    const sheet = getResponseSheet();
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);

    return jsonResponse({
      ok: true,
      inserted_rows: rows.length,
      participant_id: payload.participant && payload.participant.participantId,
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function parsePayload(event) {
  const body = event && event.postData && event.postData.contents;
  if (!body) {
    throw new Error("Missing request body.");
  }
  return JSON.parse(body);
}

function normalizeRows(payload) {
  const participant = payload.participant || {};
  const responses = Array.isArray(payload.responses) ? payload.responses : [];
  const receivedAt = new Date().toISOString();
  const rawPayload = JSON.stringify(payload);

  return responses.map((response) => [
    receivedAt,
    response.participant_id || participant.participantId || "",
    response.study_id || participant.studyId || "",
    response.session_id || participant.sessionId || "",
    payload.session_started_at || "",
    payload.exported_at || "",
    response.collection || "",
    response.source || "",
    response.title || "",
    response.target_word || "",
    response.video_url || "",
    response.order_index || "",
    getRating(response, "iconicity"),
    getRating(response, "sensorimotor_imagery"),
    getRating(response, "cultural_familiarity"),
    response.gesture_description || "",
    response.ambiguities || "",
    response.watch_seconds || "",
    response.response_seconds || "",
    response.submitted_at || "",
    participant.notes || "",
    rawPayload,
  ]);
}

function getRating(response, key) {
  return response && response.ratings && response.ratings[key] != null ? response.ratings[key] : "";
}

function getResponseSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("This script must be bound to a Google Sheet.");
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const existingHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeaders = existingHeaders.every((value) => value === "");
  if (needsHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

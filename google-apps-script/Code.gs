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
  "motional_salience_gesture",
  "emotional_salience_facial_expression",
  "gesture_complexity_fit",
  "cultural_familiarity",
  "enactment_potential",
  "gesture_description",
  "ambiguities",
  "watch_seconds",
  "response_seconds",
  "submitted_at",
  "participant_notes",
  "raw_payload",
  "response_id",
  "block_id",
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
    const result = upsertRows(sheet, rows);

    return jsonResponse({
      ok: true,
      inserted_rows: result.inserted,
      updated_rows: result.updated,
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
    getRating(response, "motional_salience_gesture"),
    getRating(response, "emotional_salience_facial_expression"),
    getRating(response, "gesture_complexity_fit"),
    getRating(response, "cultural_familiarity"),
    getRating(response, "enactment_potential"),
    response.gesture_description || "",
    response.ambiguities || "",
    response.watch_seconds || "",
    response.response_seconds || "",
    response.submitted_at || "",
    participant.notes || "",
    rawPayload,
    response.response_id || buildResponseId(response, participant),
    response.block_id || participant.block || payload.block || "",
  ]);
}

function buildResponseId(response, participant) {
  return [
    response.participant_id || participant.participantId || "anonymous",
    response.session_id || participant.sessionId || "session",
    response.collection || "video",
    response.title || "untitled",
  ].join("::");
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

  ensureHeaders(sheet);

  return sheet;
}

function ensureHeaders(sheet) {
  const width = Math.max(sheet.getLastColumn(), HEADERS.length);
  const existingHeaders = sheet.getRange(1, 1, 1, width).getValues()[0];
  const hasAnyHeader = existingHeaders.some((value) => value !== "");

  if (!hasAnyHeader) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return;
  }

  HEADERS.forEach((header, index) => {
    if (existingHeaders[index] !== header) {
      sheet.getRange(1, index + 1).setValue(header);
    }
  });
  sheet.setFrozenRows(1);
}

function upsertRows(sheet, rows) {
  const responseIdColumn = HEADERS.indexOf("response_id") + 1;
  const lastRow = sheet.getLastRow();
  const existing = {};

  if (lastRow > 1) {
    const values = sheet.getRange(2, responseIdColumn, lastRow - 1, 1).getValues();
    values.forEach((row, index) => {
      const responseId = row[0];
      if (responseId) {
        existing[responseId] = index + 2;
      }
    });
  }

  let inserted = 0;
  let updated = 0;
  rows.forEach((row) => {
    const responseId = row[responseIdColumn - 1];
    const existingRow = existing[responseId];
    if (existingRow) {
      sheet.getRange(existingRow, 1, 1, HEADERS.length).setValues([row]);
      updated += 1;
    } else {
      const nextRow = sheet.getLastRow() + 1;
      sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([row]);
      existing[responseId] = nextRow;
      inserted += 1;
    }
  });

  return { inserted, updated };
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

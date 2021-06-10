const MessageType = {
  JOIN_NEW: 1,
  JOIN_EXISTING: 2, // + uuid (32 bytes),
  MOVE: 3, // + from (1 byte) + to (1 byte),
  WELCOME: 4,
  WELCOME_NEW: 5, // + uuid (32 bytes),
  START_GAME: 6, // + player color (1 byte),
  CURRENT_STATE: 7, // + color (1 byte) + game state (1 byte) + pieces (up to 24 bytes),
  WRONG_MOVE: 8, // + from (1 byte) + error code (1 byte),
  MOVE_OK: 9, // + from (1 byte) + to (1 byte) + end turn (1 byte) + promote (1 byte) + captured field number (1 byte),
  GAME_END: 10, // + game state (1 byte),
};

function encodeMessage(messageType, data) {
  let buffer;
  let dataView;
  switch (messageType) {
    case MessageType.JOIN_NEW:
      buffer = new ArrayBuffer(1);
      dataView = new DataView(buffer);
      dataView.setUint8(0, MessageType.JOIN_NEW);
      break;
    case MessageType.JOIN_EXISTING:
      buffer = new ArrayBuffer(33);
      dataView = new DataView(buffer);
      dataView.setUint8(0, MessageType.JOIN_EXISTING);
      let textEncoder = new TextEncoder("utf-8");
      let encoded_str = textEncoder.encode(data.uuid);
      for (let i = 0; i < 32; i++) {
        dataView.setUint8(i + 1, encoded_str[i]);
      }
      break;
    case MessageType.MOVE:
      buffer = new ArrayBuffer(3);
      dataView = new DataView(buffer);
      dataView.setUint8(0, MessageType.MOVE);
      dataView.setUint8(1, data.from);
      dataView.setUint8(2, data.to);
      break;
    default:
      break;
  }
  return buffer;
}

function decodeMessage(binaryData) {
  let dataView = new DataView(binaryData);
  let messageType = dataView.getUint8(0);
  let decoded;
  switch (messageType) {
    case MessageType.WELCOME:
      decoded = { type: MessageType.WELCOME };
      break;
    case MessageType.WELCOME_NEW:
      let textDecoder = new TextDecoder("utf-8");
      let cut = new Uint8Array(binaryData.slice(1));
      let uuid = textDecoder.decode(cut);
      decoded = { type: MessageType.WELCOME_NEW, uuid: uuid };
      break;
    case MessageType.START_GAME:
      decoded = { type: MessageType.START_GAME, color: dataView.getUint8(1) };
      break;
    case MessageType.CURRENT_STATE:
      let pieces = [];
      for (let i = 0; i < binaryData.byteLength; i++) {
        let pieceData = dataView.getUint8(i);
        pieces.push({
          color: ((pieceData & 0x40) >> 6) + 1,
          type: ((pieceData & 0x80) >> 7) + 1,
          fieldNo: pieceData & (0x3F),
        });
      }
      decoded = {
        type: MessageType.CURRENT_STATE,
        color: dataView.getUint8(1),
        gameState: dataView.getUint8(2),
        pieces: pieces,
      };
      break;
    case MessageType.WRONG_MOVE:
      decoded = {
        type: MessageType.WRONG_MOVE,
        from: dataView.getUint8(1),
        error: dataView.getUint8(2),
      };
      break;
    case MessageType.MOVE_OK:
      decoded = {
        type: MessageType.MOVE_OK,
        from: dataView.getUint8(1),
        to: dataView.getUint8(2),
        endTurn: dataView.getUint8(3),
        promote: dataView.getUint8(4),
        capturedFieldNo: dataView.getUint8(5),
      };
      break;
    case MessageType.GAME_END:
      decoded = {
          type: MessageType.GAME_END,
          gameState: dataView.getUint8(1),
      };
    break;
    default:
      break;
  }
  return decoded;
}

export { MessageType as default, encodeMessage, decodeMessage };

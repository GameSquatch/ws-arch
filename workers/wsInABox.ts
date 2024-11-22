declare var self: DedicatedWorkerGlobalScope;
export {};

const ws = new WebSocket('ws://localhost:5174');
let msgQueue: string[] = [];

ws.onopen = (e) => {
  if (msgQueue.length > 0) {
    for (const msg of msgQueue) {
      ws.send(msg);
    }
    msgQueue = [];
  }
};

ws.onmessage = (e: MessageEvent<string>) => {
  const msg = JSON.parse(e.data);
  if (msg.type === 'design') {
    const { type, rootId } = determineTreeType(msg);
    msg.type = type;
    msg.rootId = rootId;
  }
  self.postMessage(msg);
};

ws.onclose = (_) => {
  console.log('Websocket closing');
};
ws.onerror = (e: Event) => {
  console.error('Error with websocket: ', e);
};

self.onmessage = (e: MessageEvent<string>) => {
  // if sending request, we can await a response to do special stuff
  // like load platform requests, specifically with asp and platform trees
  if (ws.readyState !== WebSocket.OPEN) {
    msgQueue.push(e.data);
  } else {
    ws.send(e.data);
  }
};

function determineTreeType(msg: { [key: string]: any }): { type: 'aspTree' | 'platformTree'; rootId: string } {
  for (const design of msg.data) {
    if (design.attributes.id === 'IDS_PART_ASP') {
      return { type: 'aspTree', rootId: design.id };
    }
    if (design.attributes.id === 'IDS_PART_PLATFORM_STUB') {
      return { type: 'platformTree', rootId: design.id };
    }
  }
  throw new Error('Design types should always have an ASP or Platform Stub part. We did not find either');
}

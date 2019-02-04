const mappings = require('./index.json') as any;

interface Checklist {
  destinationId: string | undefined;
  destinationHash: number | undefined;
  bubbleId: string | undefined;
  bubbleHash: number | undefined;
  recordHash: number | undefined;
}

interface Record {
  destinationId: string | undefined;
  destinationHash: number | undefined;
  bubbleId: string | undefined;
  bubbleHash: number | undefined;
}

interface Mappings {
  records: { [key: string]: Record };
  checklists: { [key: string]: Checklist };
}

export default mappings as Mappings;

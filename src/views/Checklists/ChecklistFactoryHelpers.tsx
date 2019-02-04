import sortBy from 'lodash/sortBy';
import find from 'lodash/find';

import React, { ReactNode } from 'react';

import Checklist from './Checklist';
import ChecklistItem from './ChecklistItem';
import mappings from '../../data/mappings';
import manifest from '../../utils/manifest';
import i18next from 'i18next';
import { DestinyChecklistEntryDefinition, DestinyBubbleDefinition } from 'bungie-api-ts/destiny2';

// For when the mappings generated from lowlines' data don't have a
// bubbleHash but do have a bubbleId. Inferred by cross-referencing
// with https://docs.google.com/spreadsheets/d/1qgZtT1qbUFjyV8-ni73m6UCHTcuLmuLBx-zn_B7NFkY/edit#gid=1808601275
const manualBubbleNames = {
  default: 'The Farm',
  'high-plains': 'High Plains',
  erebus: 'The Shattered Throne',
  descent: 'The Shattered Throne',
  eleusinia: 'The Shattered Throne',
  'cimmerian-garrison': 'Cimmerian Garrison',
  'shattered-ruins': 'Shattered Ruins',
  'agonarch-abyss': 'Agonarch Abyss',
  'keep-of-honed-edges': 'Keep of Honed Edges',
  ouroborea: 'Ouroborea',
  'forfeit-shrine': 'Forfeit Shrine',
  adytum: 'The Corrupted',
  'queens-court': 'The Queens Court',
  'ascendant-plane': 'Dark Monastery'
} as { [key:string]:string };

// Anything here gets merged in to created items - use it when you need to
// override something in item()
const itemOverrides = {
  // Brephos II is listed as Temple of Illyn, but it's only available
  // during the strike, so hardcode it here to be consistent with the other
  // strike item.
  1370818869: {
    bubble: 'The Corrupted'
  }
} as { [key:string]:Partial<ChecklistItemData> };

interface ChecklistItemData {
  place: string | undefined,
  bubble: string | undefined,
  hash: number,
  destinationHash: number | undefined,
  item: DestinyChecklistEntryDefinition,
  completed: boolean,
  record?: string | undefined
  destination?: string | undefined,
  activity?: string | undefined,
  itemNumber?: number | undefined,
  inventoryItem?: string | undefined,
  lore?: string | undefined,
}

interface ChecklistOptions {
  name: string,
  icon: string,
  progressDescription: string,
  items: Array<ChecklistItemData>,
  binding?: ReactNode,
  sortBy?: Array<string>,
  itemTitle?: (i: ChecklistItemData) => ReactNode,
  itemSubtitle?: (i: ChecklistItemData) => ReactNode,
  mapPath?: (i: ChecklistItemData) => string | undefined
}

interface ChecklistOutput {
  name: string,
  icon: string,
  checklist: ReactNode
}

class ChecklistFactoryHelpers {
  t: i18next.TranslationFunction;
  profile: DestinyProfile;
  characterId: string;
  hideCompletedItems: boolean;

  constructor(t: i18next.TranslationFunction, profile: DestinyProfile, characterId: string, hideCompletedItems: boolean) {
    this.t = t;
    this.profile = profile;
    this.characterId = characterId;
    this.hideCompletedItems = hideCompletedItems;
  }

  checklistItems(checklistHash: number, isCharacterBound = false): Array<ChecklistItemData> {
    const progressionSource = isCharacterBound ? this.profile.characterProgressions.data[this.characterId] : this.profile.profileProgression.data;
    const progression = progressionSource.checklists[checklistHash];
    const checklist = manifest.DestinyChecklistDefinition[checklistHash];

    return Object.entries(progression).map(([id, completed]) => {
      const item = find(checklist.entries, { hash: parseInt(id) });

      return this.checklistItem(item!, completed as boolean);
    });
  }

  checklistItem(item: DestinyChecklistEntryDefinition, completed = false): ChecklistItemData {
    const mapping = mappings.checklists[item.hash] || {};

    const destinationHash = item.destinationHash || mapping.destinationHash;
    const bubbleHash = item.bubbleHash || mapping.bubbleHash;

    // Try to find the destination, place and bubble by the hashes if we have them
    const destination = destinationHash ? manifest.DestinyDestinationDefinition[destinationHash] : undefined;
    const place = destination ? manifest.DestinyPlaceDefinition[destination.placeHash]: undefined;
    const bubble = (bubbleHash && destination) ? find(destination.bubbles, { hash: bubbleHash }) : undefined;

    // If the item has a name with a number in it, extract it so we can use it later
    // for sorting & display
    const numberMatch = item.displayProperties.name.match(/([0-9]+)/);
    const itemNumber = numberMatch && numberMatch[0];

    // Discover things needed only for adventures & sleeper nodes & bones
    const activity = item.activityHash ? manifest.DestinyActivityDefinition[item.activityHash] : undefined;
    const inventoryItem = manifest.DestinyInventoryItemDefinition[item.itemHash!];
    const record = mapping.recordHash ? manifest.DestinyRecordDefinition[mapping.recordHash] : undefined;
    const lore = record ? manifest.DestinyLoreDefinition[record.loreHash!]: undefined;

    // If we don't have a bubble, see if we can infer one from the bubble ID
    let bubbleName = (bubble && bubble.displayProperties.name) || (mapping.bubbleId && manualBubbleNames[mapping.bubbleId]) || undefined;

    return {
      destination: destination && destination.displayProperties.name,
      place: place && place.displayProperties.name,
      bubble: bubbleName,
      activity: activity && activity.displayProperties.name,
      itemNumber: itemNumber ? parseInt(itemNumber, 10) : undefined,
      inventoryItem: inventoryItem && inventoryItem.displayProperties.description,
      lore: lore && lore.displayProperties.name,
      hash: item.hash,
      destinationHash,
      item,
      completed,
      ...itemOverrides[item.hash]
    };
  }

  presentationItems(presentationHash: number, dropFirst = true): Array<ChecklistItemData> {
    const root = manifest.DestinyPresentationNodeDefinition[presentationHash];
    let recordHashes = root.children.records.map(r => r.recordHash);
    if (dropFirst) recordHashes = recordHashes.slice(1);

    const items = [] as Array<ChecklistItemData>;
    recordHashes
      .forEach(hash => {
        const item = manifest.DestinyRecordDefinition[hash];
        const profileRecord = this.profile.profileRecords.data.records[hash];
        if (!profileRecord) return;
        const completed = profileRecord.objectives[0].complete;

        const mapping = mappings.records[hash];
        const destinationHash = mapping && mapping.destinationHash;
        const destination = destinationHash && manifest.DestinyDestinationDefinition[destinationHash];
        const place = destination && manifest.DestinyPlaceDefinition[destination.placeHash];
        const bubble = destination && find(destination.bubbles, { hash: mapping.bubbleHash });

        // If we don't have a bubble, see if we can infer one from the bubble ID
        let bubbleName = (bubble && bubble.displayProperties.name) || (mapping && mapping.bubbleId && manualBubbleNames[mapping.bubbleId]) || '';

        items.push({
          place: place ? place.displayProperties.name : undefined,
          bubble: bubbleName,
          record: item.displayProperties.name,
          hash,
          destinationHash,
          item,
          completed,
          ...itemOverrides[item.hash]
        });
      })

      return items;
  }

  numberedChecklist(name: string, options: ChecklistOptions): ChecklistOutput {
    return this.checklist({
      sortBy: ['itemNumber'],
      itemTitle: (i: ChecklistItemData) => `${this.t(name)} ${i.itemNumber}`,
      ...options
    });
  }

  recordChecklist(options: ChecklistOptions): ChecklistOutput {
    return this.checklist({
      itemTitle: (i: ChecklistItemData) => i.record,
      itemSubtitle: (i: ChecklistItemData) => (i.bubble && i.place ? `${i.bubble}, ${i.place}` : <em>Forsaken Campaign</em>),
      mapPath: (i: ChecklistItemData) => i.destinationHash ? `destiny/maps/${i.destinationHash}/record/${i.hash}` : undefined,
      ...options
    });
  }

  checklist(options: ChecklistOptions): ChecklistOutput {
    const defaultOptions = {
      binding: this.t('Profile bound'),
      itemTitle: (i: ChecklistItemData) => i.bubble || '???',
      itemSubtitle: (i: ChecklistItemData) => i.place,
      mapPath: (i: ChecklistItemData) => i.destinationHash ? `destiny/maps/${i.destinationHash}/${i.hash}` : undefined
    };

    options = { ...defaultOptions, ...options };

    const items = options.sortBy ? sortBy(options.items, options.sortBy) : options.items;
    const visible = this.hideCompletedItems ? items.filter(i => !i.completed) : items;

    const checklist = (
      <Checklist name={options.name} binding={options.binding!} progressDescription={options.progressDescription} totalItems={items.length} completedItems={items.filter(i => i.completed).length}>
        {visible.map(i => (
          <ChecklistItem key={i.hash} completed={i.completed} mapPath={options.mapPath!(i)}>
            <div className='text'>
              <p>{options.itemTitle!(i)}</p>
              {options.itemSubtitle!(i) && <p>{options.itemSubtitle!(i)}</p>}
            </div>
          </ChecklistItem>
        ))}
      </Checklist>
    );

    return {
      name: options.name,
      icon: options.icon,
      checklist: checklist
    };
  }
}

export default ChecklistFactoryHelpers;
